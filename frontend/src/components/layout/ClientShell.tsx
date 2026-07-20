'use client'
import { usePathname } from 'next/navigation'
import SmoothScrollProvider from './SmoothScrollProvider'
import CustomCursor from './CustomCursor'
import Navbar from './Navbar'
import Footer from './Footer'
import { LogoProvider } from './LogoContext'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return <>{children}</>
  const isHome = pathname === '/'
  return (
    <LogoProvider>
      <SmoothScrollProvider>
        <CustomCursor />
        <Navbar />
        {/* Non-home pages: push content below the fixed logo's bottom edge.
            Home page keeps zero top padding — HeroIntro starts at the viewport top. */}
        <main style={isHome ? undefined : { paddingTop: 'var(--page-top)' }}>
          {children}
        </main>
        <Footer />
      </SmoothScrollProvider>
    </LogoProvider>
  )
}
