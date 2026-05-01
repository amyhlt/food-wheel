// pages/index.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Wheel from '../components/Wheel'
import RestaurantWheel from '../components/RestaurantWheel'
import RecipeDetail from '../components/RecipeDetail'
import RecipeImage from '../components/RecipeImage'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 菜谱相关状态
  const [recipes, setRecipes] = useState([])
  const [mode, setMode] = useState('cook')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [currentResult, setCurrentResult] = useState(null)
  const [comboItems, setComboItems] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  // 饭店相关状态
  const [restaurants, setRestaurants] = useState([])
  const [currentRestaurant, setCurrentRestaurant] = useState(null)
  const [eatMode, setEatMode] = useState('regular')
  const [nearbyRestaurants, setNearbyRestaurants] = useState([])
  const [selectedNearby, setSelectedNearby] = useState([])
  const [showNearbyList, setShowNearbyList] = useState(false)
  const [nearbyLoading, setNearbyLoading] = useState(false)

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 加载数据
  useEffect(() => {
    if (!loading) {
      fetch('/api/recipes')
        .then(res => res.json())
        .then(data => setRecipes(Array.isArray(data) ? data : []))
      fetch('/api/restaurants')
        .then(res => res.json())
        .then(data => setRestaurants(Array.isArray(data) ? data : []))
    }
  }, [loading])

  const categories = ['全部', '主食', '荤菜', '素菜', '汤', '凉菜']
  
  const filteredRecipes = selectedCategory === '全部' 
    ? recipes 
    : recipes.filter(r => r?.category === selectedCategory)

  const getFullMealCombo = () => {
    if (!Array.isArray(recipes) || recipes.length === 0) return []
    
    const staple = recipes.filter(r => r?.category === '主食')
    const meat = recipes.filter(r => r?.category === '荤菜')
    const veg = recipes.filter(r => r?.category === '素菜')
    const soup = recipes.filter(r => r?.category === '汤')
    const cold = recipes.filter(r => r?.category === '凉菜')
    
    const combo = []
    if (staple.length > 0) combo.push(staple[Math.floor(Math.random() * staple.length)])
    if (meat.length > 0) combo.push(meat[Math.floor(Math.random() * meat.length)])
    if (veg.length > 0) combo.push(veg[Math.floor(Math.random() * veg.length)])
    if (soup.length > 0) combo.push(soup[Math.floor(Math.random() * soup.length)])
    if (cold.length > 0) combo.push(cold[Math.floor(Math.random() * cold.length)])
    return combo
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentResult(null)
    if (category === '全部') {
      const newCombo = getFullMealCombo()
      setComboItems(newCombo)
    }
  }

  const handleSpinEnd = (result) => {
    setCurrentResult(result)
  }

  const addToCombo = () => {
    if (currentResult && !comboItems.find(item => item.id === currentResult.id)) {
      setComboItems([...comboItems, currentResult])
      setCurrentResult(null)
    }
  }

  const removeFromCombo = (id) => {
    setComboItems(comboItems.filter(item => item.id !== id))
  }

  const clearCombo = () => {
    setComboItems([])
  }

  const refreshCombo = () => {
    if (selectedCategory === '全部') {
      const newCombo = getFullMealCombo()
      setComboItems(newCombo)
    }
  }

  const getNearbyRestaurants = () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持定位')
      return
    }

    setNearbyLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`/api/nearby?lat=${latitude}&lng=${longitude}&radius=1000`)
          const data = await res.json()
          if (data.error) {
            alert(data.error)
          } else {
            setNearbyRestaurants(data)
          }
        } catch (error) {
          alert('搜索失败，请重试')
        }
        setNearbyLoading(false)
      },
      (error) => {
        alert('获取位置失败，请检查定位权限')
        setNearbyLoading(false)
      }
    )
  }

  const getCategoryCount = (category) => {
    if (!Array.isArray(recipes)) return 0
    if (category === '全部') return recipes.length
    return recipes.filter(r => r?.category === category).length
  }

  // 添加菜品收藏
const addToFavorites = async (recipe) => {
  // 获取当前 session 的 token
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    alert('请先登录')
    router.push('/login')
    return
  }
  
  const token = session.access_token
  
  try {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // 添加 token
      },
      body: JSON.stringify({ recipe_id: recipe.id })
    })
    
    const data = await res.json()
    
    if (res.ok) {
      alert(`已收藏：${recipe.name}`)
    } else if (res.status === 400) {
      alert('已经收藏过了')
    } else {
      alert('收藏失败: ' + (data.error || '未知错误'))
    }
  } catch (error) {
    console.error('收藏失败', error)
    alert('收藏失败，请重试')
  }
}

  const getCategoryEmoji = (category) => {
    const map = { '主食': '🍚', '荤菜': '🥩', '素菜': '🥬', '汤': '🥣', '凉菜': '🥗' }
    return map[category] || '🍽️'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-animate flex items-center justify-center">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-animate">
      {/* 漂浮食物 Emoji */}
      <div className="fixed bottom-8 right-8 text-5xl opacity-20 pointer-events-none z-0 animate-float">🍕</div>
      <div className="fixed top-32 left-4 text-4xl opacity-15 pointer-events-none z-0 animate-float" style={{ animationDelay: '1s' }}>🍜</div>
      <div className="fixed bottom-40 left-12 text-3xl opacity-15 pointer-events-none z-0 animate-float" style={{ animationDelay: '2s' }}>🍚</div>
      <div className="fixed top-60 right-8 text-5xl opacity-15 pointer-events-none z-0 animate-float" style={{ animationDelay: '0.5s' }}>🥘</div>
      {/* 首页浮动食物点缀 */}
      <div className="fixed top-20 left-5 text-3xl opacity-30 pointer-events-none z-0 animate-float-slow">🍕</div>
      <div className="fixed top-40 right-8 text-4xl opacity-25 pointer-events-none z-0 animate-float-fast">🍜</div>
      <div className="fixed bottom-32 left-10 text-3xl opacity-20 pointer-events-none z-0 animate-float-delay">🍚</div>
      <div className="fixed bottom-20 right-12 text-5xl opacity-20 pointer-events-none z-0 animate-float-slow">🥘</div>
      <div className="fixed top-1/2 left-4 text-2xl opacity-15 pointer-events-none z-0 animate-float-fast">🍣</div>
      <div className="fixed top-2/3 right-6 text-3xl opacity-15 pointer-events-none z-0 animate-float-delay">🥟</div>
      <div className="fixed top-1/4 right-1/3 text-2xl opacity-10 pointer-events-none z-0 animate-spin-slow">🍥</div>
          <div className="fixed bottom-1/3 left-1/4 text-2xl opacity-10 pointer-events-none z-0 animate-float-slow">🍢</div> 
      {/* 头部导航 */}
      <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">今天吃什么</h1>
           
          </div>
          
          <div className="flex gap-5 items-center">
            <Link href="/recipes" className="text-gray-600 hover:text-purple-500 transition text-sm">📝 菜谱</Link>
            <Link href="/favorites" className="text-gray-600 hover:text-purple-500 transition text-sm">⭐ 收藏</Link>
            <Link href="/restaurants" className="text-gray-600 hover:text-purple-500 transition text-sm">🏪 饭店</Link>
            {user ? (
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 transition text-sm">🚪 退出</button>
            ) : (
              <Link href="/login" className="text-purple-500 hover:text-purple-600 transition text-sm font-medium">登录/注册</Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative z-0">
        
        {/* 模式切换 */}
        <div className="bg-black/10 backdrop-blur-md rounded-full p-1 w-64 mx-auto mb-10">
          <div className="flex">
            <button
              onClick={() => setMode('cook')}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                mode === 'cook' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-white/30'
              }`}
            >
              🏠 在家做饭
            </button>
            <button
              onClick={() => setMode('eat')}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                mode === 'eat' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-white/30'
              }`}
            >
              🍽️ 外出就餐
            </button>
          </div>
        </div>

        {/* 在家做饭模式 */}
        {mode === 'cook' && (
          <>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map(cat => {
                const count = getCategoryCount(cat)
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                        : 'bg-white/60 backdrop-blur-sm text-gray-600 hover:bg-white/80'
                    }`}
                  >
                    {cat} <span className="text-xs opacity-70">({count})</span>
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-6 transition-all">
                {filteredRecipes.length > 0 ? (
                  <Wheel items={filteredRecipes} onSpinEnd={handleSpinEnd} />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">😅</div>
                    <p className="text-gray-500">暂无菜谱</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🎯</span>
                    <h3 className="font-semibold text-gray-700">转盘结果</h3>
                  </div>
                  {currentResult ? (
  <div className="bg-purple-50/80 rounded-2xl p-4">
    <div className="flex items-center gap-4">
      {/* 图片 - 可点击弹窗 */}
      <div onClick={() => setSelectedRecipe(currentResult)} style={{ cursor: 'pointer' }}>
        <RecipeImage foodName={currentResult.name} category={currentResult.category} size={60} />
      </div>
      {/* 菜名 - 可点击弹窗 */}
      <div className="flex-1">
        <div 
          onClick={() => setSelectedRecipe(currentResult)} 
          style={{ cursor: 'pointer' }}
          className="font-bold text-lg text-gray-800"
        >
          {currentResult.name}
        </div>
        <div className="text-sm text-gray-500">{currentResult.category}</div>
      </div>
      {/* 按钮组 */}
      <div className="flex gap-2">
        {/* 加入组合按钮 - 所有人可用 */}
        <button
          onClick={addToCombo}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition"
        >
          + 加入
        </button>
        {/* 收藏按钮 - 只有登录用户可用 */}
        {user ? (
          <button onClick={() => addToFavorites(currentResult)} className="text-2xl hover:scale-110 transition">
            ⭐
          </button>
        ) : (
          <Link href="/login" className="text-2xl text-gray-300 hover:text-gray-400">⭐</Link>
        )}
      </div>
    </div>
  </div>
) : (
  <div className="bg-gray-50/50 rounded-2xl py-12 text-center">
    <div className="text-5xl mb-2">🎡</div>
    <p className="text-gray-400">点击转盘开始</p>
  </div>
)}
                 
                </div>

                <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📦</span>
                      <h3 className="font-semibold text-gray-700">今日组合</h3>
                    </div>
                    <div className="flex gap-3">
                      {selectedCategory === '全部' && comboItems.length > 0 && (
                        <button onClick={refreshCombo} className="text-purple-500 text-sm hover:underline">🔄 换一批</button>
                      )}
                      {comboItems.length > 0 && (
                        <button onClick={clearCombo} className="text-gray-400 text-sm hover:text-red-500">清空</button>
                      )}
                    </div>
                  </div>

                  {comboItems.length > 0 ? (
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        {comboItems.map((item, idx) => (
                          <div key={item.id} className="flex items-center">
                            <div onClick={() => setSelectedRecipe(item)} style={{ cursor: 'pointer' }} className="text-center">
                              <RecipeImage foodName={item.name} category={item.category} size={70} />
                              <div className="text-sm text-gray-600 mt-1">{item.name}</div>
                            </div>
                            <button onClick={() => removeFromCombo(item.id)} className="ml-1 text-gray-400 hover:text-red-500 text-lg">✕</button>
                            {idx < comboItems.length - 1 && <span className="text-gray-300 text-xl ml-2">+</span>}
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition">🍽️ 今天就吃这些！</button>
                    </div>
                  ) : (
                    <div className="bg-gray-50/50 rounded-2xl py-10 text-center">
                      <div className="text-4xl mb-2">🍽️</div>
                      <p className="text-gray-400 text-sm">{selectedCategory === '全部' ? '点击"换一批"生成组合' : '从转盘添加菜品到组合'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 外出就餐模式 */}
        {mode === 'eat' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <div className="flex gap-2 mb-6 bg-gray-100/50 rounded-full p-1">
                <button
                  onClick={() => {
                    setEatMode('regular')
                    setCurrentRestaurant(null)
                  }}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                    eatMode === 'regular' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  🏪 我的常去
                </button>
                <button
                  onClick={() => {
                    setEatMode('nearby')
                    setShowNearbyList(true)
                    setSelectedNearby([])
                    setCurrentRestaurant(null)
                    getNearbyRestaurants()
                  }}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                    eatMode === 'nearby' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  📍 附近探索
                </button>
              </div>

              {eatMode === 'regular' && (
                <>
                  {restaurants.length > 0 ? (
                    <>
                      <RestaurantWheel items={restaurants} onSpinEnd={(result) => setCurrentRestaurant(result)} />
                      <div className="mt-4 text-center text-sm text-gray-400">共 {restaurants.length} 家常去饭店</div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">🏪</div>
                      <p className="text-gray-500">暂无常去饭店</p>
                      <Link href="/restaurants" className="text-purple-500 text-sm mt-2 inline-block">+ 添加饭店</Link>
                    </div>
                  )}
                </>
              )}

              {eatMode === 'nearby' && (
                <div>
                  {nearbyLoading ? (
                    <div className="text-center py-12">
                      <div className="text-3xl mb-3">📍</div>
                      <p className="text-gray-500">正在搜索附近美食...</p>
                    </div>
                  ) : showNearbyList && nearbyRestaurants.length > 0 ? (
                    <div>
                      <div className="mb-3 text-sm text-gray-500">
                        <input type="checkbox" onChange={(e) => setSelectedNearby(e.target.checked ? [...nearbyRestaurants] : [])} className="mr-2" />
                        全选 ({nearbyRestaurants.length}家)
                      </div>
                      <div className="max-h-80 overflow-auto space-y-2 mb-4">
                        {nearbyRestaurants.map(rest => (
                          <div key={rest.id} className="flex items-center gap-3 p-3 border-b border-gray-100">
                            <input type="checkbox" checked={selectedNearby.some(r => r.id === rest.id)} onChange={(e) => {
                              if (e.target.checked) setSelectedNearby([...selectedNearby, rest])
                              else setSelectedNearby(selectedNearby.filter(r => r.id !== rest.id))
                            }} />
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{rest.name}</div>
                              <div className="text-xs text-gray-400">{rest.address}</div>
                              <div className="text-xs text-purple-500 mt-1">⭐ {rest.rating} | {rest.distance}米</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => { if (selectedNearby.length === 0) alert('请至少选择一家'); else setShowNearbyList(false) }} className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-full font-semibold mb-2 shadow-md">🎡 开始转盘 ({selectedNearby.length}家)</button>
                      <button onClick={getNearbyRestaurants} className="w-full bg-gray-100 text-gray-600 py-2 rounded-full text-sm hover:bg-gray-200 transition">🔄 重新搜索</button>
                    </div>
                  ) : !showNearbyList && selectedNearby.length > 0 ? (
                    <div>
                      <RestaurantWheel items={selectedNearby} onSpinEnd={(result) => setCurrentRestaurant(result)} />
                      <button onClick={() => setShowNearbyList(true)} className="w-full mt-4 bg-gray-100 text-gray-600 py-2 rounded-full text-sm hover:bg-gray-200 transition">← 返回选择</button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📍</div>
                      <p className="text-gray-500">点击搜索附近美食</p>
                      <button onClick={getNearbyRestaurants} className="mt-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full shadow-md">开始搜索</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎯</span>
                <h3 className="font-semibold text-gray-700">选中结果</h3>
              </div>
              {currentRestaurant ? (
                <div className="text-center">
                  <div className="text-5xl mb-3">🏪</div>
                  <div className="text-2xl font-bold text-gray-800">{currentRestaurant.name}</div>
                  <div className="text-sm text-gray-500 mt-2">{currentRestaurant.address}</div>
                  {currentRestaurant.rating && currentRestaurant.rating !== '暂无' && <div className="text-sm text-purple-500 mt-1">⭐ {currentRestaurant.rating}分</div>}
                  {currentRestaurant.distance && <div className="text-xs text-gray-400 mt-1">距离 {currentRestaurant.distance}米</div>}
                  <button onClick={() => window.open(`https://uri.amap.com/search?keyword=${encodeURIComponent(currentRestaurant.name)}`)} className="mt-5 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-md hover:bg-green-600 transition">🗺️ 一键导航</button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🎡</div>
                  <p className="text-gray-400">选择饭店后，转盘会帮你决定</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedRecipe && <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
    </div>
  )
}