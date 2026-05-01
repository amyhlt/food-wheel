// components/FoodImage.js - 带调试日志
import { useState } from 'react'

export default function FoodImage({ foodName, category }) {
  const [imageError, setImageError] = useState(false)

  const getCategoryEmoji = (cat) => {
    const emojiMap = {
      '主食': '🍚', '荤菜': '🥩', '素菜': '🥬', '汤': '🥣', '凉菜': '🥗'
    }
    return emojiMap[cat] || '🍽️'
  }

  // 构建图片路径
  const imagePath = `/images/recipes/${foodName}.jpg`
  
  // 打印日志，检查路径
  console.log('图片路径:', imagePath)

  if (imageError) {
    return (
      <div style={{
        width: 60,
        height: 60,
        background: '#f97316',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28
      }}>
        {getCategoryEmoji(category)}
      </div>
    )
  }

  return (
    <img
      src={imagePath}
      alt={foodName}
      style={{
        width: 60,
        height: 60,
        borderRadius: 16,
        objectFit: 'cover'
      }}
      onError={(e) => {
        console.log('图片加载失败:', imagePath)
        setImageError(true)
      }}
    />
  )
}