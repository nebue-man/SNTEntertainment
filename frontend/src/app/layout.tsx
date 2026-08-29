import type { Metadata } from 'next'
import { Bungee, Hanken_Grotesk, Space_Mono } from 'next/font/google'
import '@/styles/globals.css'
import ClientShell from '@/components/layout/ClientShell'

const bungee = Bungee({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bungee.variable} ${hankenGrotesk.variable} ${spaceMono.variable}`}
    >
      <body className="bg-absolute-zero text-ghost-white">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
