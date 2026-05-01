// components/RecipeImage.js
import { useState, useEffect } from 'react'

export default function RecipeImage({ foodName, category, size = 60 }) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 当 foodName 变化时重置状态
  useEffect(() => {
    setImageError(false)
    setIsLoading(true)
  }, [foodName])

  const getEmoji = () => {
    const emojiMap = {
      '主食': '🍚', '荤菜': '🥩', '素菜': '🥬', '汤': '🥣', '凉菜': '🥗'
    }
    return emojiMap[category] || '🍽️'
  }

  if (imageError) {
    return (
      <div style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        color: 'white'
      }}>
        {getEmoji()}
      </div>
    )
  }

  return (
    <img
      src={`/images/recipes/${foodName}.jpg`}
      alt={foodName}
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        objectFit: 'cover'
      }}
      onError={() => setImageError(true)}
      onLoad={() => setIsLoading(false)}
    />
  )
}