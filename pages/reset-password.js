// pages/reset-password.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage('两次输入的密码不一致')
      return
    }
    
    if (password.length < 6) {
      setMessage('密码长度至少6位')
      return
    }
    
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('密码修改成功！即将跳转到登录页...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-animate flex items-center justify-center p-4">
        {/* 登录页浮动食物点缀 */}
<div className="fixed top-20 right-12 text-4xl opacity-20 pointer-events-none z-0 animate-float-slow">🍽️</div>
<div className="fixed bottom-32 left-8 text-3xl opacity-15 pointer-events-none z-0 animate-float-fast">🍜</div>
<div className="fixed top-1/2 right-8 text-2xl opacity-10 pointer-events-none z-0 animate-float-delay">🥘</div>
<div className="fixed bottom-20 right-1/4 text-3xl opacity-10 pointer-events-none z-0 animate-spin-slow">🍚</div>
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-4xl block">🔐</span>
          <h1 className="text-2xl font-bold text-gray-700 mt-2">设置新密码</h1>
          <p className="text-gray-400 text-sm mt-1">请设置你的新密码</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            placeholder="新密码（至少6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            required
          />
          <input
            type="password"
            placeholder="确认新密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? '修改中...' : '确认修改'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link href="/login" className="text-purple-500 text-sm hover:underline">
            ← 返回登录
          </Link>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-xl text-sm text-center ${
            message.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}