// pages/index.js - 全部按钮自动生成组合版
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Wheel from '../components/Wheel'

import RecipeDetail from '../components/RecipeDetail'

export default function Home() {
  const [recipes, setRecipes] = useState([])
  const [mode, setMode] = useState('cook')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [currentResult, setCurrentResult] = useState(null)
  const [comboItems, setComboItems] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  useEffect(() => {
    fetch('/api/recipes')
      .then(res => res.json())
      .then(data => setRecipes(data))
  }, [])

  const categories = ['全部', '主食', '荤菜', '素菜', '汤', '凉菜']
  
  const filteredRecipes = selectedCategory === '全部' 
    ? recipes 
    : recipes.filter(r => r.category === selectedCategory)

  // 从指定分类中随机取 n 道不重复的菜
  // 从指定分类中随机取菜（用于"全部"模式生成套餐）
const getFullMealCombo = () => {
  const staple = recipes.filter(r => r.category === '主食')
  const meat = recipes.filter(r => r.category === '荤菜')
  const veg = recipes.filter(r => r.category === '素菜')
  const soup = recipes.filter(r => r.category === '汤')
  const cold = recipes.filter(r => r.category === '凉菜')
  
  const combo = []
  
  // 各取一道（如果存在的话）
  if (staple.length > 0) {
    combo.push(staple[Math.floor(Math.random() * staple.length)])
  }
  if (meat.length > 0) {
    combo.push(meat[Math.floor(Math.random() * meat.length)])
  }
  if (veg.length > 0) {
    combo.push(veg[Math.floor(Math.random() * veg.length)])
  }
  if (soup.length > 0) {
    combo.push(soup[Math.floor(Math.random() * soup.length)])
  }
  if (cold.length > 0) {
    combo.push(cold[Math.floor(Math.random() * cold.length)])
  }
  
  return combo
}

  // 处理分类切换
  
  // 处理分类切换
 const handleCategoryChange = (category) => {
  setSelectedCategory(category)
  setCurrentResult(null)
  
  // 点击"全部"时，生成完整套餐
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

  // 手动生成新组合（当在"全部"模式下，点刷新按钮）
  // 刷新组合（只在"全部"模式下有效）
  const refreshCombo = () => {
    if (selectedCategory === '全部') {
     const newCombo = getFullMealCombo()
     setComboItems(newCombo)
     }
  }

  const getCategoryEmoji = (category) => {
    const map = { '主食': '🍚', '荤菜': '🥩', '素菜': '🥬', '汤': '🥣', '凉菜': '🥗' }
    return map[category] || '🍽️'
  }

  const getCategoryCount = (category) => {
    if (category === '全部') return recipes.length
    return recipes.filter(r => r.category === category).length
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5eb 0%, #ffe4cc 100%)' }}>
      {/* 头部 */}
      <div style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>🍽️</span>
            <h1 style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>食光转盘</h1>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/recipes"><a style={{ color: '#666', textDecoration: 'none' }}>📝 菜谱</a></Link>
            <Link href="/restaurants"><a style={{ color: '#666', textDecoration: 'none' }}>🏪 饭店</a></Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {/* 模式切换 */}
        <div style={{ background: 'white', borderRadius: 50, padding: 4, display: 'flex', maxWidth: 300, margin: '0 auto 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button
            onClick={() => setMode('cook')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 50,
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              background: mode === 'cook' ? '#f97316' : 'transparent',
              color: mode === 'cook' ? 'white' : '#666'
            }}
          >
            🏠 在家做饭
          </button>
          <button
            onClick={() => setMode('eat')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 50,
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              background: mode === 'eat' ? '#f97316' : 'transparent',
              color: mode === 'eat' ? 'white' : '#666'
            }}
          >
            🍽️ 外出就餐
          </button>
        </div>

        {mode === 'cook' && (
          <>
            {/* 分类筛选 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              {categories.map(cat => {
                const count = getCategoryCount(cat)
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 50,
                      border: 'none',
                      fontSize: 13,
                      cursor: 'pointer',
                      background: isActive ? '#f97316' : 'white',
                      color: isActive ? 'white' : '#666',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>

            {/* 两栏布局 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* 左侧转盘 */}
              <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {filteredRecipes.length > 0 ? (
                  <Wheel items={filteredRecipes} onSpinEnd={handleSpinEnd} />
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>😅</div>
                    <p style={{ color: '#999' }}>暂无菜谱</p>
                    <Link href="/recipes"><a style={{ color: '#f97316' }}>添加菜谱</a></Link>
                  </div>
                )}
              </div>

              {/* 右侧结果 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 转盘结果 */}
                <div style={{ background: 'white', borderRadius: 24, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🎯</span> 转盘结果
                  </h3>
                  {currentResult ? (
                    <div style={{ background: '#fff5eb', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 32 }}>{getCategoryEmoji(currentResult.category)}</span>
                           
                         <div onClick={() => setSelectedRecipe(currentResult)} style={{ cursor: 'pointer' }}>
                           <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{currentResult.name}</div>
                           <div style={{ fontSize: 12, color: '#999' }}>{currentResult.category}</div>
			 </div>
                      </div>
                      <button
                        onClick={addToCombo}
                        style={{
                          background: '#f97316',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 50,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        + 加入组合
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: '#f5f5f5', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>🎡</div>
                      <p style={{ color: '#999' }}></p>
                    </div>
                  )}
                </div>

                {/* 今日组合 */}
                <div style={{ background: 'white', borderRadius: 24, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📦</span> 今日组合
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {selectedCategory === '全部' && comboItems.length > 0 && (
                        <button onClick={refreshCombo} style={{ background: 'none', border: 'none', color: '#f97316', fontSize: 12, cursor: 'pointer' }}>
                          🔄 换一批
                        </button>
                      )}
                      {comboItems.length > 0 && (
                        <button onClick={clearCombo} style={{ background: 'none', border: 'none', color: '#999', fontSize: 12, cursor: 'pointer' }}>
                          清空
                        </button>
                      )}
                    </div>
                  </div>

                  {comboItems.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                        {comboItems.map((item, idx) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ background: '#f97316', color: 'white', padding: '6px 12px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{getCategoryEmoji(item.category)}</span>
                              <span style={{ fontSize: 14 }}>{item.name}</span>
                              <button
                                onClick={() => removeFromCombo(item.id)}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer', marginLeft: 4 }}
                              >
                                ×
                              </button>
                            </div>
                            {idx < comboItems.length - 1 && <span style={{ color: '#ccc', marginLeft: 4 }}>+</span>}
                          </div>
                        ))}
                      </div>
                      <button style={{
                        width: '100%',
                        marginTop: 16,
                        background: '#f97316',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: 50,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                        🍽️ 今天就吃这些！
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: '#f5f5f5', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
                      <p style={{ color: '#999', fontSize: 13 }}>
                        {selectedCategory === '全部' ? '点击"换一批"生成组合' : '从转盘添加菜品到组合'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'eat' && (
          <div style={{ background: 'white', borderRadius: 24, padding: 48, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <p style={{ color: '#666' }}>外出就餐功能开发中</p>
            <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>即将支持：附近搜索 · 收藏好店 · 一键导航</p>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* 底部弹窗 - 放在这里，在 return 的最末尾，所有内容之后 */}
      {/* ================================================== */}
      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
     </div>
  )
}