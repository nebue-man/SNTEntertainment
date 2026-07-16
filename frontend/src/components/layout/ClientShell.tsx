'use client'
import { usePathname } from 'next/navigation'
import SmoothScrollProvider from './SmoothScrollProvider'
import CustomCursor from './CustomCursor'
import Navbar from './Navbar'
import Footer from './Footer'
import LogoIntro from './LogoIntro'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return <>{children}</>
  return (
    <SmoothScrollProvider>
      <LogoIntro />
      <CustomCursor />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </SmoothScrollProvider>
  )
}
