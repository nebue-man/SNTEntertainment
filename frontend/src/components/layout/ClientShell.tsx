'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import SmoothScroll from './SmoothScroll'
import Navbar from './Navbar'
import Footer from './Footer'
import { LogoProvider } from './LogoContext'
import GetInTouchButton from '@/components/ui/GetInTouchButton'
import AmbientDiveBackground from '@/components/AmbientDiveBackground'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const footerRef = useRef<HTMLDivElement>(null)
  const [footerVisible, setFooterVisible] = useState(false)
  const [heroScrolled, setHeroScrolled] = useState(false)

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

  // On the homepage the hero fills 100vh (sticky) inside a 200vh wrapper.
  // Keep the CTA hidden until the user has scrolled past that sticky zone.
  useEffect(() => {
    if (pathname !== '/') {
      setHeroScrolled(true)
      return
    }
    setHeroScrolled(false)
    const onScroll = () => {
      setHeroScrolled(window.scrollY >= window.innerHeight * 0.85)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  if (pathname?.startsWith('/admin')) return <>{children}</>
  const isHome = pathname === '/'
  const ctaVisible = heroScrolled && !footerVisible

  return (
    <LogoProvider>
      <SmoothScroll>
        <AmbientDiveBackground />
        <Navbar />
        <main style={isHome ? undefined : { paddingTop: 'var(--page-top)' }}>
          {children}
        </main>
        <div ref={footerRef}>
          <Footer />
        </div>

        {/* Fixed CTA — hidden on homepage until hero scrolls past; fades out near footer */}
        <div
          className="hidden lg:block fixed bottom-8 right-8 z-[155]"
          style={{
            opacity:       ctaVisible ? 1 : 0,
            pointerEvents: ctaVisible ? 'auto' : 'none',
            transform:     ctaVisible ? 'translateY(0)' : 'translateY(10px)',
            transition:    'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <GetInTouchButton
            onClick={() => { window.location.href = 'mailto:info.sntentertainments@gmail.com' }}
          />
        </div>
      </SmoothScroll>
    </LogoProvider>
  )
}
