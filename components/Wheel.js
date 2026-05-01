// components/Wheel.js
import { useRef, useEffect, useState } from 'react'

export default function Wheel({ items, onSpinEnd }) {
  const canvasRef = useRef(null)
  const [isSpinning, setIsSpinning] = useState(false)
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7B05E', '#B5E3D5', '#FF9999',
    '#6C5CE7', '#00CEC9', '#FF8C42', '#6AB04A', '#F9CA24'
  ]

  const drawWheel = (angle = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const center = size / 2
    const radius = size * 0.42
    
    ctx.clearRect(0, 0, size, size)
    
    if (items.length === 0) {
      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#999'
      ctx.textAlign = 'center'
      ctx.fillText('暂无数据', center, center)
      return
    }
    
    const sliceAngle = (Math.PI * 2) / items.length
    
    items.forEach((item, i) => {
      const startAngle = i * sliceAngle + angle
      const endAngle = startAngle + sliceAngle
      
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px "PingFang SC", "Microsoft YaHei"'
      ctx.shadowBlur = 1
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      
      const textX = radius * 0.65
      let displayName = item.name
      if (displayName.length > 6) {
        displayName = displayName.slice(0, 5) + '..'
      }
      ctx.fillText(displayName, textX, 0)
      ctx.restore()
    })
    
    // 中心圆
    ctx.beginPath()
    ctx.arc(center, center, radius * 0.12, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(center, center, radius * 0.06, 0, Math.PI * 2)
    ctx.fillStyle = '#f97316'
    ctx.fill()
  }

  const spin = () => {
    if (isSpinning || items.length === 0) return
    
    setIsSpinning(true)
    const spinAngle = 360 * 6 + Math.random() * 360
    const startTime = Date.now()
    const duration = 2000
    
    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const angle = spinAngle * easeOut
      const rad = (angle * Math.PI) / 180
      
      drawWheel(rad)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        const sliceAngle = (Math.PI * 2) / items.length
        const pointerAngle = Math.PI * 1.5
        let finalAngle = rad % (Math.PI * 2)
        let index = Math.floor(((pointerAngle + Math.PI * 2 - finalAngle) % (Math.PI * 2)) / sliceAngle)
        index = (index + items.length) % items.length
        
        setIsSpinning(false)
        if (onSpinEnd) onSpinEnd(items[index])
      }
    }
    
    animate()
  }

  useEffect(() => {
    drawWheel()
  }, [items])

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400}
          className="w-80 h-80"
        />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-red-500"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mt-1"></div>
        </div>
      </div>
      <button
        onClick={spin}
        disabled={isSpinning || items.length === 0}
        className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-lg py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
      >
        {isSpinning ? '🎲 转起来...' : '🎡 开始转盘'}
      </button>
    </div>
  )
}