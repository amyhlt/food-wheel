// pages/test-db.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TestDB() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .limit(5)
      
      setResult({ data, error })
      setLoading(false)
    }
    test()
  }, [])

  if (loading) {
    return <div className="p-8">加载中...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">数据库测试</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}