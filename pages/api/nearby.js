// pages/api/nearby.js
import axios from 'axios'

export default async function handler(req, res) {
  const { lat, lng, radius = 1000, keyword = '美食' } = req.query

  if (!lat || !lng) {
    return res.status(400).json({ error: '缺少位置信息' })
  }

  // 你的高德 API Key
  const AMAP_KEY = '57aa05e4695ab92700c72787792646ef'

  try {
    const url = `https://restapi.amap.com/v3/place/around`
    const response = await axios.get(url, {
      params: {
        key: AMAP_KEY,
        location: `${lng},${lat}`,
        radius: radius,
        keywords: keyword,
        types: '050000', // 美食类别
        output: 'JSON',
        sortrule: 'rating', // 按评分排序
        offset: 20 // 返回20条
      }
    })

    if (response.data.status === '1') {
      const restaurants = response.data.pois.map(poi => ({
        id: poi.id,
        name: poi.name,
        address: poi.address,
        lat: poi.location.split(',')[1],
        lng: poi.location.split(',')[0],
        rating: poi.biz_ext?.rating || '暂无',
        category: poi.type,
        distance: poi.distance,
        tel: poi.tel || ''
      }))
      res.status(200).json(restaurants)
    } else {
      res.status(500).json({ error: response.data.info })
    }
  } catch (error) {
    console.error('高德API错误:', error)
    res.status(500).json({ error: '搜索失败' })
  }
}