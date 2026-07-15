import type { Metadata } from 'next'
import '@/styles/globals.css'
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider'
import CustomCursor from '@/components/layout/CustomCursor'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LogoIntro from '@/components/layout/LogoIntro'

export const metadata: Metadata = {
  title: {
    default: "SNT Live Events — Sri Lanka's Premier Live Music Company",
    template: '%s | SNT Live Events',
  },
  description:
    'SNT organizes world-class live music events with top-tier bands across Sri Lanka.',
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    siteName: 'SNT Live Events',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-absolute-zero text-ghost-white font-lausanne">
        <SmoothScrollProvider>
          <LogoIntro />
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
