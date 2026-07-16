'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn, clearToken, adminLogout } from '@/lib/adminApi'

const NAV = [
  { label: 'Events', href: '/admin/events' },
  { label: 'Ticket Requests', href: '/admin/ticket-requests' },
  { label: 'Media', href: '/admin/media' },
  { label: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (isLoginPage) { setReady(true); return }
    if (!isLoggedIn()) { router.replace('/admin/login'); return }
    setReady(true)
  }, [isLoginPage, router])

  if (isLoginPage) return <div className="min-h-screen bg-black">{children}</div>
  if (!ready) return <div className="min-h-screen bg-black" />

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white font-lausanne">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 flex flex-col border-r border-[#4d4d4d] h-screen overflow-y-auto">
        <div className="px-6 py-5 border-b border-[#4d4d4d]">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#d3fd50] font-light">
            SNT Admin
          </span>
        </div>

        <nav className="flex-1 py-3">
          {NAV.map(({ label, href }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-6 py-3 text-[13px] font-light tracking-wide transition-colors ${
                  active
                    ? 'text-[#d3fd50] border-l-2 border-[#d3fd50] pl-[22px]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-5 border-t border-[#4d4d4d]">
          <button
            onClick={async () => {
              await adminLogout().catch(() => {})
              clearToken()
              router.replace('/admin/login')
            }}
            className="text-[12px] text-white/30 hover:text-white/70 transition-colors tracking-wide"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
