// components/FoodCard.js
export default function FoodCard({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: 28,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
      className={className}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(249,115,22,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.06)'
      }}
    >
      {children}
    </div>
  )
}