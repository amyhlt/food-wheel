// pages/api/recipes.js
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'recipes.json')

function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }
  if (!fs.existsSync(dataPath)) {
    const defaultRecipes = [
      { id: 1, name: "������", category: "���", createdAt: new Date().toISOString() },
      { id: 2, name: "���ѳ���", category: "�ز�", createdAt: new Date().toISOString() },
      { id: 3, name: "��������˿", category: "�ز�", createdAt: new Date().toISOString() },
      { id: 4, name: "���Ŷ���", category: "���", createdAt: new Date().toISOString() },
      { id: 5, name: "������", category: "��ʳ", createdAt: new Date().toISOString() },
      { id: 6, name: "��������", category: "���", createdAt: new Date().toISOString() },
      { id: 7, name: "���ּ���", category: "���", createdAt: new Date().toISOString() },
      { id: 8, name: "������", category: "�ز�", createdAt: new Date().toISOString() },
      { id: 9, name: "�����Ź���", category: "��", createdAt: new Date().toISOString() },
      { id: 10, name: "����ƹ�", category: "����", createdAt: new Date().toISOString() }
    ]
    fs.writeFileSync(dataPath, JSON.stringify(defaultRecipes, null, 2), 'utf8')
  }
}

function getData() {
  ensureDataFile()
  const data = fs.readFileSync(dataPath, 'utf8')
  return JSON.parse(data)
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8')
}

export default function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      const recipes = getData()
      res.status(200).json(recipes)
      break

    case 'POST':
      
      const { name, category } = req.body
      if (!name) {
        return res.status(400).json({ error: '��������Ϊ��' })
      }
      const currentData = getData()
      const newRecipe = {
            id: Date.now(),
            name,
            category: category || 'δ����',
            videoUrl: body.videoUrl || '',
             recipeUrl: body.recipeUrl || '',
             createdAt: new Date().toISOString()
      }
      currentData.push(newRecipe)
      saveData(currentData)
      res.status(201).json(newRecipe)
      break

    case 'DELETE':
      const { id } = req.query
      if (!id) {
        return res.status(400).json({ error: 'ȱ�� id' })
      }
      let data = getData()
      data = data.filter(item => item.id !== parseInt(id))
      saveData(data)
      res.status(200).json({ success: true })
      break
       
    case 'PUT':
      const updatedRecipe = req.body
      let putData = getData()
      const index = putData.findIndex(item => item.id === updatedRecipe.id)
      putData[index] = { ...putData[index], ...updatedRecipe }
      if (index !== -1) {
        putData[index] = { ...putData[index], ...updatedRecipe }
        saveData(putData)
        res.status(200).json(putData[index])
      } else {
          res.status(404).json({ error: '���ײ�����' })
              }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}