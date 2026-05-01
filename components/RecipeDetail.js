// components/RecipeDetail.js - 修复视频链接读取
import { useState } from 'react'
import RecipeImage from './RecipeImage'

export default function RecipeDetail({ recipe, onClose }) {
  const [activeTab, setActiveTab] = useState('video')

  if (!recipe) return null

  // 兼容两种字段名
  const hasVideo = recipe.video_url || recipe.videoUrl
  const hasRecipe = recipe.recipe_url || recipe.recipeUrl

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        maxWidth: 500,
        width: '100%',
        maxHeight: '85vh',
        overflow: 'auto',
        padding: 20
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* 头部 */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <RecipeImage foodName={recipe.name} category={recipe.category} size={80} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{recipe.name}</h2>
            <p style={{ color: '#999', fontSize: 14 }}>{recipe.category}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        {/* 标签页 */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #f0f0f0', marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab('video')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'video' ? '#f97316' : '#666',
              borderBottom: activeTab === 'video' ? '2px solid #f97316' : 'none',
              fontWeight: activeTab === 'video' ? 'bold' : 'normal'
            }}
          >
            📺 视频教程
          </button>
          
        </div>

        {/* 视频教程 */}
        {activeTab === 'video' && (
          <div style={{ minHeight: 200 }}>
            {hasVideo ? (
              <a
                href={recipe.video_url || recipe.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: '#f97316',
                  color: 'white',
                  padding: '14px',
                  textAlign: 'center',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                🎬 观看视频教程
              </a>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
                <p>暂无视频教程</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>可在菜谱管理中补充链接</p>
              </div>
            )}
          </div>
        )}

       
      </div>
    </div>
  )
}