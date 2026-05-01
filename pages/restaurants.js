// pages/restaurants.js - 直接使用 Supabase 客户端版
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Restaurants() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState([])
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category: '',
    note: '',
    city: ''
  })
  const router = useRouter()

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/login?redirect=/restaurants')
      } else {
        setUser(session.user)
        fetchRestaurants()
      }
      setLoading(false)
    })
  }, [])

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.error('获取饭店失败:', error)
    } else {
      setRestaurants(data || [])
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return
    
    if (editingRestaurant) {
      // 更新饭店
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          address: formData.address,
          category: formData.category,
          note: formData.note,
          city: formData.city
        })
        .eq('id', editingRestaurant.id)
      
      if (error) {
        alert('更新失败: ' + error.message)
      } else {
        setFormData({ name: '', address: '', category: '', note: '', city: '' })
        setEditingRestaurant(null)
        fetchRestaurants()
      }
    } else {
      // 添加新饭店
      const { error } = await supabase
        .from('restaurants')
        .insert({
          name: formData.name,
          address: formData.address,
          category: formData.category,
          note: formData.note,
          city: formData.city
        })
      
      if (error) {
        alert('添加失败: ' + error.message)
      } else {
        setFormData({ name: '', address: '', category: '', note: '', city: '' })
        fetchRestaurants()
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除吗？')) return
    
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('删除失败: ' + error.message)
    } else {
      fetchRestaurants()
    }
  }

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant)
    setFormData({
      name: restaurant.name,
      address: restaurant.address || '',
      category: restaurant.category || '',
      note: restaurant.note || '',
      city: restaurant.city || ''
    })
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
      {/* 饭店页浮动食物点缀 */}
<div className="fixed top-20 left-8 text-3xl opacity-25 pointer-events-none z-0 animate-float-slow">🏪</div>
<div className="fixed bottom-32 right-10 text-4xl opacity-20 pointer-events-none z-0 animate-float-fast">📍</div>
<div className="fixed top-1/2 left-6 text-2xl opacity-15 pointer-events-none z-0 animate-float-delay">🍽️</div>
<div className="fixed bottom-1/3 right-1/4 text-3xl opacity-15 pointer-events-none z-0 animate-float-slow">🥢</div>
<div className="fixed top-2/3 left-1/3 text-2xl opacity-10 pointer-events-none z-0 animate-spin-slow">🧾</div>
      <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-white/30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">饭店管理</h1>
          </div>
          <div className="flex gap-5">
            <Link href="/" className="text-gray-600 hover:text-purple-500 transition text-sm">🏠 首页</Link>
            <Link href="/recipes" className="text-gray-600 hover:text-purple-500 transition text-sm">📝 菜谱</Link>
            <Link href="/favorites" className="text-gray-600 hover:text-purple-500 transition text-sm">⭐ 收藏</Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 添加/编辑表单 - 登录用户可见 */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-xl">{editingRestaurant ? '✏️' : '➕'}</span>
            {editingRestaurant ? '编辑饭店' : '添加常去饭店'}
          </h2>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="饭店名称 *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            />
            <input
              type="text"
              placeholder="地址"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            />
            <input
              type="text"
              placeholder="城市（如：北京、上海）"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            />
            <input
              type="text"
              placeholder="分类（如：川菜、粤菜、快餐）"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            />
            <input
              type="text"
              placeholder="备注（如：推荐菜、停车建议）"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
              >
                {editingRestaurant ? '保存修改' : '添加饭店'}
              </button>
              {editingRestaurant && (
                <button
                  onClick={() => {
                    setEditingRestaurant(null)
                    setFormData({ name: '', address: '', category: '', note: '', city: '' })
                  }}
                  className="px-5 bg-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 饭店列表 */}
        <div className="glass-card overflow-hidden">
          {restaurants.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🏪</div>
              <p className="text-gray-500">暂无饭店</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {restaurants.map(restaurant => (
                <div key={restaurant.id} className="p-4 flex justify-between items-start hover:bg-white/30 transition">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{restaurant.name}</div>
                    {restaurant.address && <div className="text-sm text-gray-500 mt-1">📍 {restaurant.address}</div>}
                    {restaurant.city && <div className="text-xs text-purple-500 mt-1">🏙️ {restaurant.city}</div>}
                    {restaurant.category && <div className="text-xs text-gray-400 mt-1">🏷️ {restaurant.category}</div>}
                    {restaurant.note && <div className="text-xs text-gray-400 mt-1">📝 {restaurant.note}</div>}
                  </div>
                  {/* 编辑/删除按钮 - 只有管理员可见 */}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(restaurant)} className="text-purple-500 hover:text-purple-600 text-sm px-3 py-1">编辑</button>
                      <button onClick={() => handleDelete(restaurant.id)} className="text-red-400 hover:text-red-500 text-sm px-3 py-1">删除</button>
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