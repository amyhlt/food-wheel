// scripts/migrate.js - 修复编码问题
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase 配置 - 替换成你的
const supabaseUrl = 'https://你的项目ID.supabase.co'
const supabaseAnonKey = '你的anon公钥'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 读取本地 JSON 数据（使用 utf8 编码）
const recipesPath = path.join(__dirname, '../data/recipes.json')
const restaurantsPath = path.join(__dirname, '../data/restaurants.json')
const favoritesPath = path.join(__dirname, '../data/favorites.json')

let recipesData = []
let restaurantsData = []
let favoritesData = []

try {
  const rawData = fs.readFileSync(recipesPath, 'utf8')
  recipesData = JSON.parse(rawData)
  console.log(`读取到 ${recipesData.length} 条菜谱`)
} catch (e) {
  console.log('没有 recipes.json 或文件为空')
}

try {
  const rawData = fs.readFileSync(restaurantsPath, 'utf8')
  restaurantsData = JSON.parse(rawData)
  console.log(`读取到 ${restaurantsData.length} 条饭店`)
} catch (e) {
  console.log('没有 restaurants.json 或文件为空')
}

try {
  const rawData = fs.readFileSync(favoritesPath, 'utf8')
  favoritesData = JSON.parse(rawData)
  console.log(`读取到 ${favoritesData.length} 条收藏`)
} catch (e) {
  console.log('没有 favorites.json 或文件为空')
}

async function migrate() {
  console.log('\n开始迁移数据...\n')

  if (recipesData.length === 0 && restaurantsData.length === 0 && favoritesData.length === 0) {
    console.log('没有数据需要迁移')
    return
  }

  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('请输入你的 user_id: ', async (userId) => {
    if (!userId) {
      console.log('user_id 不能为空')
      rl.close()
      return
    }

    console.log(`\n开始迁移到 user_id: ${userId}\n`)

    // 迁移菜谱
    if (recipesData.length > 0) {
      console.log(`迁移 ${recipesData.length} 条菜谱...`)
      for (const recipe of recipesData) {
        // 确保数据是字符串格式
        const name = String(recipe.name || '')
        const category = String(recipe.category || '未分类')
        const videoUrl = String(recipe.videoUrl || recipe.video_url || '')
        const recipeUrl = String(recipe.recipeUrl || recipe.recipe_url || '')
        
        if (!name) {
          console.log(`  ✗ 跳过: 菜名为空`)
          continue
        }
        
        const { error } = await supabase.from('recipes').insert({
          user_id: userId,
          name: name,
          category: category,
          video_url: videoUrl,
          recipe_url: recipeUrl
        })
        if (error) {
          console.log(`  ✗ 失败: ${name} - ${error.message}`)
        } else {
          console.log(`  ✓ 成功: ${name}`)
        }
        // 添加小延迟避免请求过快
        await new Promise(r => setTimeout(r, 100))
      }
    }

    // 迁移饭店
    if (restaurantsData.length > 0) {
      console.log(`\n迁移 ${restaurantsData.length} 条饭店...`)
      for (const restaurant of restaurantsData) {
        const name = String(restaurant.name || '')
        const address = String(restaurant.address || '')
        const category = String(restaurant.category || '')
        const note = String(restaurant.note || '')
        
        if (!name) continue
        
        const { error } = await supabase.from('restaurants').insert({
          user_id: userId,
          name: name,
          address: address,
          category: category,
          note: note
        })
        if (error) {
          console.log(`  ✗ 失败: ${name} - ${error.message}`)
        } else {
          console.log(`  ✓ 成功: ${name}`)
        }
        await new Promise(r => setTimeout(r, 100))
      }
    }

    // 迁移收藏
    if (favoritesData.length > 0) {
      console.log(`\n迁移 ${favoritesData.length} 条收藏...`)
      for (const favorite of favoritesData) {
        const recipeName = String(favorite.recipeName || favorite.recipe_name || '')
        const category = String(favorite.category || '')
        
        if (!recipeName) continue
        
        const { error } = await supabase.from('favorites').insert({
          user_id: userId,
          recipe_name: recipeName,
          category: category
        })
        if (error) {
          console.log(`  ✗ 失败: ${recipeName} - ${error.message}`)
        } else {
          console.log(`  ✓ 成功: ${recipeName}`)
        }
        await new Promise(r => setTimeout(r, 100))
      }
    }

    console.log('\n迁移完成！')
    rl.close()
  })
}

migrate()
