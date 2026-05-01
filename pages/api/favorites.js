// pages/api/favorites.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { method } = req

  // 从请求头获取 token
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: '请先登录' })
  }

  // 用 token 创建服务端 Supabase 客户端
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )

  // 获取当前用户
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser()
  
  if (userError || !user) {
    console.error('获取用户失败:', userError)
    return res.status(401).json({ error: '请先登录' })
  }

  // GET - 获取用户的收藏
  if (method === 'GET') {
    const { data: favorites, error } = await supabaseServer
      .from('user_favorites')
      .select('*, recipes(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json(favorites || [])
  }

  // POST - 添加收藏
  if (method === 'POST') {
    const { recipe_id } = req.body
    
    if (!recipe_id) {
      return res.status(400).json({ error: '缺少 recipe_id' })
    }
    
    // 检查是否已收藏
    const { data: existing } = await supabaseServer
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipe_id)
      .maybeSingle()
    
    if (existing) {
      return res.status(400).json({ error: '已经收藏过了' })
    }
    
    // 添加收藏
    const { data: newFavorite, error } = await supabaseServer
      .from('user_favorites')
      .insert({ user_id: user.id, recipe_id })
      .select()
      .single()
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(201).json(newFavorite)
  }

  // DELETE - 删除收藏
  if (method === 'DELETE') {
    const { id } = req.query
    
    if (!id) {
      return res.status(400).json({ error: '缺少 id' })
    }
    
    const { error } = await supabaseServer
      .from('user_favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(200).json({ success: true })
  }

  res.status(405).end()
}