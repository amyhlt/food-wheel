// pages/api/recipes.js
import { supabase } from '../../lib/supabase'

const ADMIN_EMAILS = ['huilitang1@gmail.com']

export default async function handler(req, res) {
  const { method } = req

  // GET - 任何人可查看
  if (method === 'GET') {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(recipes || [])
  }

  // 以下操作需要登录
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return res.status(401).json({ error: '请先登录' })
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email)

  // POST - 任何登录用户都可以添加
  if (method === 'POST') {
    const { name, category, videoUrl, recipeUrl } = req.body
    
    const { data: newRecipe, error } = await supabase
      .from('recipes')
      .insert({ name, category, video_url: videoUrl, recipe_url: recipeUrl })
      .select()
      .single()
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(201).json(newRecipe)
  }

  // PUT/DELETE - 只有管理员可以
  if (method === 'PUT') {
    if (!isAdmin) {
      return res.status(403).json({ error: '只有管理员可以修改菜谱' })
    }
    const { id, name, category, videoUrl, recipeUrl } = req.body
    const { data: updatedRecipe, error } = await supabase
      .from('recipes')
      .update({ name, category, video_url: videoUrl, recipe_url: recipeUrl })
      .eq('id', id)
      .select()
      .single()
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(updatedRecipe)
  }

  if (method === 'DELETE') {
    if (!isAdmin) {
      return res.status(403).json({ error: '只有管理员可以删除菜谱' })
    }
    const { id } = req.query
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).end()
}