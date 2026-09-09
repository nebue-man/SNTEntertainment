'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import SmoothScrollProvider from './SmoothScrollProvider'
import CustomCursor from './CustomCursor'
import Navbar from './Navbar'
import Footer from './Footer'
import { LogoProvider } from './LogoContext'
import GetInTouchButton from '@/components/ui/GetInTouchButton'
import AmbientDiveBackground from '@/components/AmbientDiveBackground'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const footerRef = useRef<HTMLDivElement>(null)
  const [footerVisible, setFooterVisible] = useState(false)

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (pathname?.startsWith('/admin')) return <>{children}</>
  const isHome = pathname === '/'
  return (
    <LogoProvider>
      <SmoothScrollProvider>
        <AmbientDiveBackground />
        <CustomCursor />
        <Navbar />
        <main style={isHome ? undefined : { paddingTop: 'var(--page-top)' }}>
          {children}
        </main>
        <div ref={footerRef}>
          <Footer />
        </div>

        {/* Fixed CTA — fades out when footer enters view to avoid overlapping social icons */}
        <div
          className="hidden lg:block fixed bottom-8 right-8 z-[155]"
          style={{
            opacity:       footerVisible ? 0 : 1,
            pointerEvents: footerVisible ? 'none' : 'auto',
            transition:    'opacity 0.3s ease',
          }}
        >
          <GetInTouchButton
            onClick={() => { window.location.href = 'mailto:info.sntentertainments@gmail.com' }}
          />
        </div>
      </SmoothScrollProvider>
    </LogoProvider>
  )
}
