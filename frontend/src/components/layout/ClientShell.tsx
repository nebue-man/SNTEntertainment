'use client'
import { usePathname } from 'next/navigation'
import SmoothScrollProvider from './SmoothScrollProvider'
import CustomCursor from './CustomCursor'
import ScrollLines from './ScrollLines'
import Navbar from './Navbar'
import Footer from './Footer'
import { LogoProvider } from './LogoContext'
import GetInTouchButton from '@/components/ui/GetInTouchButton'
import AmbientDiveBackground from '@/components/AmbientDiveBackground'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return <>{children}</>
  const isHome = pathname === '/'
  return (
    <LogoProvider>
      <SmoothScrollProvider>
        {/* WebGL ambient layer — z-index:-1, behind all content, admin-guarded
            by the early return above so it never renders on /admin/* routes. */}
        <AmbientDiveBackground />
        <CustomCursor />
        <ScrollLines />
        <Navbar />
        {/* Non-home pages: push content below the fixed logo's bottom edge.
            Home page keeps zero top padding — HeroIntro starts at the viewport top. */}
        <main style={isHome ? undefined : { paddingTop: 'var(--page-top)' }}>
          {children}
        </main>
        <Footer />

        {/* ── "Get In Touch" CTA — fixed floating, persists all pages ──
            z-[155] sits above BottomNav (z-[150]) but below Navbar (z-[200]).
            bottom-[88px] on mobile/tablet keeps it above BottomNav's 32px base
            + ~40px height; at lg the viewport is wide enough that right-8
            clears BottomNav's centered footprint entirely. */}
        <div className="fixed bottom-[88px] right-4 z-[155] lg:bottom-8 lg:right-8">
          <GetInTouchButton
            onClick={() => { window.location.href = 'mailto:hello@sntevents.lk' }}
          />
        </div>
      </SmoothScrollProvider>
    </LogoProvider>
  )
}
