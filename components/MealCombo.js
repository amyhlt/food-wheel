// components/MealCombo.js
import { useState, useEffect } from 'react'

export default function MealCombo({ recipes }) {
  const [combo, setCombo] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      '主食': '🍚', '荤菜': '🥩', '素菜': '🥬', '汤': '🥣', '凉菜': '🥗'
    }
    return emojiMap[category] || '🍽️'
  }

  const generateCombo = () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    
    const staple = recipes.filter(r => r.category === '主食')
    const meat = recipes.filter(r => r.category === '荤菜')
    const veg = recipes.filter(r => r.category === '素菜')
    const soup = recipes.filter(r => r.category === '汤')
    const cold = recipes.filter(r => r.category === '凉菜')
    
    const newCombo = {
      staple: staple.length > 0 ? staple[Math.floor(Math.random() * staple.length)] : null,
      meat: meat.length > 0 ? meat[Math.floor(Math.random() * meat.length)] : null,
      veg: veg.length > 0 ? veg[Math.floor(Math.random() * veg.length)] : null,
      soup: soup.length > 0 ? soup[Math.floor(Math.random() * soup.length)] : null,
      cold: cold.length > 0 ? cold[Math.floor(Math.random() * cold.length)] : null
    }
    
    setCombo(newCombo)
    
    setTimeout(() => setIsGenerating(false), 500)
  }
  
  useEffect(() => {
    if (recipes.length > 0) {
      generateCombo()
    }
  }, [recipes])
  
  if (!combo) return null
  
  const items = [
    combo.staple && { ...combo.staple, type: '主食', emoji: '🍚' },
    combo.meat && { ...combo.meat, type: '荤菜', emoji: '🥩' },
    combo.veg && { ...combo.veg, type: '素菜', emoji: '🥬' },
    combo.soup && { ...combo.soup, type: '汤', emoji: '🥣' },
    combo.cold && { ...combo.cold, type: '凉菜', emoji: '🥗' }
  ].filter(Boolean)
  
  if (items.length === 0) return null
  
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-lg p-5">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xl">🎯</span>
        <h3 className="text-lg font-bold text-white">今日推荐组合</h3>
        <span className="text-xl">✨</span>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center">
            <div className="text-center min-w-[70px]">
              <div className="text-2xl">{item.emoji}</div>
              <div className="text-xs text-white/50">{item.type}</div>
              <div className="text-sm font-medium text-white truncate max-w-[80px]">
                {item.name}
              </div>
            </div>
            {idx < items.length - 1 && (
              <span className="text-xl text-white/30 mx-1">+</span>
            )}
          </div>
        ))}
      </div>
      
      <button 
        onClick={generateCombo}
        disabled={isGenerating}
        className="w-full mt-4 bg-white/20 backdrop-blur-sm py-2.5 rounded-xl text-white hover:bg-white/30 transition-colors disabled:opacity-50"
      >
        {isGenerating ? '搭配中... 🔄' : '换一套搭配 🔄'}
      </button>
    </div>
  )
}