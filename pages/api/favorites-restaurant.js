// pages/api/favorites-restaurant.js
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'favorites-restaurant.json')

function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2))
  }
}

function getData() {
  ensureDataFile()
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
}

export default function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      const favorites = getData()
      res.status(200).json(favorites)
      break

    case 'POST':
      const { restaurantId, restaurantName, address, lat, lng } = req.body
      const currentData = getData()
      
      if (currentData.find(item => item.restaurantId === restaurantId)) {
        return res.status(400).json({ error: '已收藏' })
      }
      
      const newFavorite = {
        id: Date.now(),
        restaurantId,
        restaurantName,
        address,
        lat,
        lng,
        createdAt: new Date().toISOString()
      }
      currentData.push(newFavorite)
      saveData(currentData)
      res.status(201).json(newFavorite)
      break

    case 'DELETE':
      const { id } = req.query
      if (!id) {
        return res.status(400).json({ error: '缺少 id' })
      }
      let data = getData()
      data = data.filter(item => item.id !== parseInt(id))
      saveData(data)
      res.status(200).json({ success: true })
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}