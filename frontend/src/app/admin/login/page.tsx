'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin, setToken, isLoggedIn } from '@/lib/adminApi'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn()) router.replace('/admin/events')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminLogin(email, password)
      setToken(res.data.token)
      router.replace('/admin/events')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#d3fd50] mb-3">SNT Live Events</p>
          <h1 className="text-3xl font-light">Admin</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-transparent border border-[#4d4d4d] px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border border-[#4d4d4d] px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-[13px]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[#d3fd50] text-[#d3fd50] py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-[#d3fd50] hover:text-black transition-colors disabled:opacity-40 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
