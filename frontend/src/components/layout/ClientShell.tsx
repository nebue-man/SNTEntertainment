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
  return (
    <LogoProvider>
      <SmoothScrollProvider>
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </SmoothScrollProvider>
    </LogoProvider>
  )
}
