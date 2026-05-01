// pages/api/restaurants.js - 最终版
import { supabase } from '../../lib/supabase'

// 管理员邮箱列表
const ADMIN_EMAILS = ['huilitang1@gmail.com']

export default async function handler(req, res) {
  const { method } = req

  // GET：任何人可查看
  if (method === 'GET') {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(restaurants)
  }

  // 以下操作需要登录
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return res.status(401).json({ error: '请先登录' })
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email)

  // POST：任何人都可以添加
  if (method === 'POST') {
    const { name, address, category, note, city, lat, lng } = req.body
    const { data: newRestaurant, error } = await supabase
      .from('restaurants')
      .insert({ name, address, category, note, city, lat, lng })
      .select()
      .single()
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(newRestaurant)
  }

  // PUT/DELETE：只有管理员可以
  if (method === 'PUT') {
    if (!isAdmin) {
      return res.status(403).json({ error: '只有管理员可以修改饭店' })
    }
    const { id, name, address, category, note, city, lat, lng } = req.body
    const { data: updatedRestaurant, error } = await supabase
      .from('restaurants')
      .update({ name, address, category, note, city, lat, lng })
      .eq('id', id)
      .select()
      .single()
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(updatedRestaurant)
  }

  if (method === 'DELETE') {
    if (!isAdmin) {
      return res.status(403).json({ error: '只有管理员可以删除饭店' })
    }
    const { id } = req.query
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id)
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).end()
}