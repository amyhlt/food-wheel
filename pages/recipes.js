// pages/recipes.js - 直接使用 Supabase 客户端版
import { useState, useEffect } from 'react'
import Link from 'next/link'
import RecipeImage from '../components/RecipeImage'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    category: '荤菜',
    videoUrl: '',
    recipeUrl: ''
  })
  const [filterCategory, setFilterCategory] = useState('全部')
  const router = useRouter()

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/login?redirect=/recipes')
      } else {
        setUser(session.user)
        fetchRecipes()
      }
      setLoading(false)
    })
  }, [])

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.error('获取菜谱失败:', error)
    } else {
      setRecipes(data || [])
    }
  }

  // 过滤菜谱
  useEffect(() => {
    if (!Array.isArray(recipes)) {
      setFilteredRecipes([])
      return
    }
    
    let filtered = [...recipes]
    if (filterCategory !== '全部') {
      filtered = filtered.filter(r => r?.category === filterCategory)
    }
    if (searchKeyword.trim() !== '') {
      filtered = filtered.filter(r => 
        r?.name?.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }
    setFilteredRecipes(filtered)
  }, [recipes, searchKeyword, filterCategory])

  const handleSubmit = async () => {
    if (!formData.name.trim()) return
    
    if (editingRecipe) {
      // 更新菜谱
      const { error } = await supabase
        .from('recipes')
        .update({
          name: formData.name,
          category: formData.category,
          video_url: formData.videoUrl,
          recipe_url: formData.recipeUrl
        })
        .eq('id', editingRecipe.id)
      
      if (error) {
        alert('更新失败: ' + error.message)
      } else {
        setFormData({ name: '', category: '荤菜', videoUrl: '', recipeUrl: '' })
        setEditingRecipe(null)
        fetchRecipes()
      }
    } else {
      // 添加新菜谱
      const { error } = await supabase
        .from('recipes')
        .insert({
          name: formData.name,
          category: formData.category,
          video_url: formData.videoUrl,
          recipe_url: formData.recipeUrl
        })
      
      if (error) {
        alert('添加失败: ' + error.message)
      } else {
        setFormData({ name: '', category: '荤菜', videoUrl: '', recipeUrl: '' })
        fetchRecipes()
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这道菜吗？')) return
    
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('删除失败: ' + error.message)
    } else {
      fetchRecipes()
    }
  }

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      name: recipe.name,
      category: recipe.category,
      videoUrl: recipe.video_url || '',
      recipeUrl: recipe.recipe_url || ''
    })
  }

  const categoryEmoji = {
    '主食': '🍚', '荤菜': '🥩', '素菜': '🥬', '汤': '🥣', '凉菜': '🥗'
  }

  const categories = ['全部', '主食', '荤菜', '素菜', '汤', '凉菜']
  
  const getCategoryCount = (cat) => {
    if (!Array.isArray(recipes)) return 0
    if (cat === '全部') return recipes.length
    return recipes.filter(r => r?.category === cat).length
  }

  const isAdmin = user?.email === 'huilitang1@gmail.com'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-animate flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">🍽️</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-animate">
      {/* 菜谱页浮动食物点缀 */}
     <div className="fixed top-24 right-10 text-3xl opacity-25 pointer-events-none z-0 animate-float-slow">📝</div>
    <div className="fixed bottom-40 left-6 text-4xl opacity-20 pointer-events-none z-0 animate-float-fast">🍳</div>
    <div className="fixed top-1/2 right-8 text-3xl opacity-15 pointer-events-none z-0 animate-float-delay">🥬</div>
    <div className="fixed bottom-20 right-1/4 text-2xl opacity-15 pointer-events-none z-0 animate-float-slow">🧂</div>
    <div className="fixed top-1/3 left-8 text-2xl opacity-10 pointer-events-none z-0 animate-spin-slow">🍲</div>
      <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">菜谱管理</h1>
          </div>
          <div className="flex gap-5">
            <Link href="/" className="text-gray-600 hover:text-purple-500 transition text-sm">🏠 首页</Link>
            <Link href="/favorites" className="text-gray-600 hover:text-purple-500 transition text-sm">⭐ 收藏</Link>
            <Link href="/restaurants" className="text-gray-600 hover:text-purple-500 transition text-sm">🏪 饭店</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 添加/编辑表单 - 登录用户可见 */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-xl">{editingRecipe ? '✏️' : '➕'}</span>
            {editingRecipe ? '编辑菜谱' : '添加新菜谱'}
          </h2>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="菜名 *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            />
            <div className="flex gap-2">
              {['主食', '荤菜', '素菜', '汤', '凉菜'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`flex-1 py-2 rounded-xl text-sm transition ${
                    formData.category === cat
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                      : 'bg-white/60 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  {categoryEmoji[cat]} {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="视频链接（B站/抖音/下厨房）"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            />
           
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
              >
                {editingRecipe ? '保存修改' : '添加菜谱'}
              </button>
              {editingRecipe && (
                <button
                  onClick={() => {
                    setEditingRecipe(null)
                    setFormData({ name: '', category: '荤菜', videoUrl: '', recipeUrl: '' })
                  }}
                  className="px-5 bg-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-3 bg-white/50 rounded-full px-4 py-2 mb-4">
            <span className="text-lg">🔍</span>
            <input
              type="text"
              placeholder="搜索菜名..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none py-2"
            />
            {searchKeyword && (
              <button onClick={() => setSearchKeyword('')} className="text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const count = getCategoryCount(cat)
              const isActive = filterCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm transition ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                      : 'bg-white/60 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {searchKeyword && (
          <div className="mb-3 text-sm text-gray-500">找到 {filteredRecipes.length} 个结果</div>
        )}

        {/* 菜谱列表 */}
        <div className="glass-card overflow-hidden">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🍳</div>
              <p className="text-gray-500">暂无菜谱</p>
              {searchKeyword && <p className="text-sm text-gray-400 mt-1">试试其他关键词</p>}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRecipes.map(recipe => (
                <div key={recipe.id} className="p-4 flex justify-between items-center hover:bg-white/30 transition">
                  <div className="flex items-center gap-3">
                    <RecipeImage foodName={recipe.name} category={recipe.category} size={50} />
                    <div>
                      <div className="font-semibold text-gray-800">{recipe.name}</div>
                      <div className="text-xs text-gray-400">{recipe.category}</div>
                      {(recipe.video_url || recipe.recipe_url) && (
                        <div className="text-xs text-purple-500 mt-1">
                          {recipe.video_url && '📺 '}{recipe.recipe_url && '📖'}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 编辑/删除按钮 - 只有管理员可见 */}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(recipe)} className="text-purple-500 hover:text-purple-600 text-sm px-3 py-1">编辑</button>
                      <button onClick={() => handleDelete(recipe.id)} className="text-red-400 hover:text-red-500 text-sm px-3 py-1">删除</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}