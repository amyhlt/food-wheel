// pages/favorites.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import RecipeImage from '../components/RecipeImage'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?redirect=/favorites')
      return
    }
    await fetchFavorites()
    setLoading(false)
  }

  const fetchFavorites = async () => {
    // 获取 token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    
    const res = await fetch('/api/favorites', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    const data = await res.json()
    console.log('API返回的数据:', data)
    
    // 数据结构可能是: data 本身就是数组，每个元素有 recipes 对象
    setFavorites(Array.isArray(data) ? data : [])
  }

  const removeFavorite = async (id) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    
    const res = await fetch(`/api/favorites?id=${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    if (res.ok) {
      fetchFavorites()
    } else {
      alert('移除失败')
    }
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
      {/* 收藏页浮动食物点缀 */}
<div className="fixed top-32 right-12 text-3xl opacity-25 pointer-events-none z-0 animate-float-slow">⭐</div>
<div className="fixed bottom-40 left-8 text-4xl opacity-20 pointer-events-none z-0 animate-float-fast">❤️</div>
<div className="fixed top-2/3 right-8 text-2xl opacity-15 pointer-events-none z-0 animate-float-delay">🍱</div>
<div className="fixed bottom-20 left-1/4 text-3xl opacity-15 pointer-events-none z-0 animate-float-slow">🎁</div>
<div className="fixed top-1/2 left-1/3 text-2xl opacity-10 pointer-events-none z-0 animate-spin-slow">✨</div>
      <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">我的收藏</h1>
          </div>
          <div className="flex gap-5">
            <Link href="/" className="text-gray-600 hover:text-purple-500 transition text-sm">🏠 首页</Link>
            <Link href="/recipes" className="text-gray-600 hover:text-purple-500 transition text-sm">📝 菜谱</Link>
            <Link href="/restaurants" className="text-gray-600 hover:text-purple-500 transition text-sm">🏪 饭店</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card overflow-hidden">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">⭐</div>
              <p className="text-gray-500">暂无收藏</p>
              <p className="text-sm text-gray-400 mt-2">在转盘结果中点 ⭐ 收藏喜欢的菜</p>
              <Link href="/" className="inline-block mt-4 text-purple-500 hover:underline">去首页逛逛 →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {favorites.map(fav => {
                // 从返回的数据中获取菜谱信息
                // 可能的结构: { id, recipes: { name, category, ... } }
                const recipe = fav.recipes || fav
                return (
                  <div key={fav.id} className="p-4 flex justify-between items-center hover:bg-white/30 transition">
                    <div className="flex items-center gap-3">
                      <RecipeImage foodName={recipe.name} category={recipe.category} size={50} />
                      <div>
                        <div className="font-semibold text-gray-800">{recipe.name || '未知菜品'}</div>
                        <div className="text-xs text-gray-400">{recipe.category || '未分类'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="text-red-400 hover:text-red-500 text-sm px-3 py-1"
                    >
                      移除
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
          