// pages/login.js - 添加忘记密码
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { redirect } = router.query

  // 正常登录/注册
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    let result
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password })
      if (result.error) {
        setMessage(result.error.message)
      } else {
        setMessage('注册成功！请查收邮箱验证链接')
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password })
      if (result.error) {
        setMessage(result.error.message)
      } else {
        router.push(redirect || '/')
      }
    }
    setLoading(false)
  }

  // 找回密码
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      setMessage('请输入邮箱地址')
      return
    }
    
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('已发送密码重置邮件，请查收邮箱')
      setIsForgotPassword(false)
    }
    setLoading(false)
  }

  // 返回登录界面
  const backToLogin = () => {
    setIsForgotPassword(false)
    setMessage('')
  }

  // 忘记密码界面
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-animate flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <span className="text-4xl block cursor-pointer">🔐</span>
            <h1 className="text-2xl font-bold text-gray-700 mt-2">找回密码</h1>
            <p className="text-gray-400 text-sm mt-1">输入你的邮箱，我们将发送重置链接</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? '发送中...' : '发送重置邮件'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={backToLogin}
              className="text-purple-500 text-sm hover:underline"
            >
              ← 返回登录
            </button>
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

  // 正常登录/注册界面
  return (
    <div className="min-h-screen bg-gradient-animate flex items-center justify-center p-4">
      {/* 登录页浮动食物点缀 */}
      {/* 收藏页浮动食物点缀 */}
<div className="fixed top-32 right-12 text-3xl opacity-25 pointer-events-none z-0 animate-float-slow">⭐</div>
<div className="fixed bottom-40 left-8 text-4xl opacity-20 pointer-events-none z-0 animate-float-fast">❤️</div>
<div className="fixed top-2/3 right-8 text-2xl opacity-15 pointer-events-none z-0 animate-float-delay">🍱</div>
<div className="fixed bottom-20 left-1/4 text-3xl opacity-15 pointer-events-none z-0 animate-float-slow">🎁</div>
<div className="fixed top-1/2 left-1/3 text-2xl opacity-10 pointer-events-none z-0 animate-spin-slow">✨</div>
<div className="fixed top-20 right-12 text-4xl opacity-20 pointer-events-none z-0 animate-float-slow">🍽️</div>
<div className="fixed bottom-32 left-8 text-3xl opacity-15 pointer-events-none z-0 animate-float-fast">🍜</div>
<div className="fixed top-1/2 right-8 text-2xl opacity-10 pointer-events-none z-0 animate-float-delay">🥘</div>
<div className="fixed bottom-20 right-1/4 text-3xl opacity-10 pointer-events-none z-0 animate-spin-slow">🍚</div>
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-4xl block cursor-pointer">🍽️</Link>
          <h1 className="text-2xl font-bold text-gray-700 mt-2">今天吃什么</h1>
          <p className="text-gray-400 text-sm mt-1">{isSignUp ? '注册新账号' : '登录账号'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            required
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            required
          />
          
          {/* 忘记密码链接 */}
          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-purple-500 text-xs hover:underline"
              >
                忘记密码？
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-500 text-sm hover:underline"
          >
            {isSignUp ? '已有账号？去登录' : '没有账号？立即注册'}
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-purple-50 rounded-xl text-purple-600 text-sm text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}