'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@/lib/adminApi'

export default function AdminPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace(isLoggedIn() ? '/admin/events' : '/admin/login')
  }, [router])
  return <div className="min-h-screen bg-black" />
}
