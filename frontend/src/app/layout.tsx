import type { Metadata } from 'next'
import '@/styles/globals.css'
import ClientShell from '@/components/layout/ClientShell'

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
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
