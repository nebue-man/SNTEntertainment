import type { SVGProps } from 'react'
import Link from 'next/link'
import LogoSvg from '@/components/ui/LogoSvg'

// Placeholder URLs — real profile links need to replace these '#'s before launch.
const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', icon: InstagramIcon },
  { label: 'Facebook',  href: '#', icon: FacebookIcon },
  { label: 'TikTok',    href: '#', icon: TikTokIcon },
]

const NAV_LINKS = [
  { label: 'Home',           href: '/' },
  { label: 'Upcoming Event', href: '/events/upcoming' },
  { label: 'Past Event',     href: '/events/past' },
  { label: 'About Us',       href: '/about' },
]

const LABEL_CLASS = 'text-caption text-electric-lime tracking-widest uppercase mb-3'

export default function Footer() {
  return (
    <footer className="relative">
      {/* Top accent divider — flush at the outer top edge, before any padding */}
      <div
        aria-hidden
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(211,253,80,0.2) 20%, rgba(211,253,80,0.8) 50%, rgba(211,253,80,0.2) 80%, transparent 100%)',
        }}
      />

      <div className="px-6 pt-10 pb-[64px] md:px-10 md:pt-14 md:pb-14">
        <div className="max-w-7xl mx-auto flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <LogoSvg
              aria-label="SNT Events"
              className="h-8 w-auto text-ghost-white"
            />
            <p className="text-body-sm text-pewter max-w-xs leading-relaxed">
              From the{' '}
              <Link href="/" className="text-ghost-white hover:text-electric-lime transition-colors">Home</Link>
              {' '}stage to the{' '}
              <Link href="/events/upcoming" className="text-ghost-white hover:text-electric-lime transition-colors">Events</Link>
              {' '}lineup, get the full story on{' '}
              <Link href="/about" className="text-ghost-white hover:text-electric-lime transition-colors">About</Link>
              , or just reach out —{' '}
              <a href="mailto:hello@sntevents.lk" className="text-ghost-white hover:text-electric-lime transition-colors">Get In Touch</a>
              .
            </p>

            {/* Social icons — placeholder links, need real profile URLs before launch */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-electric-lime/40 text-electric-lime hover:border-electric-lime hover:bg-electric-lime/5 transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate + Get In Touch columns */}
          <div className="flex flex-col gap-10 md:flex-row md:gap-20">
            <nav aria-label="Footer navigation">
              <p className={LABEL_CLASS}>Navigate</p>
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-body-sm text-pewter hover:text-ghost-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className={LABEL_CLASS}>Get In Touch</p>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:hello@sntevents.lk"
                  className="text-body-sm text-ghost-white hover:text-electric-lime transition-colors"
                >
                  hello@sntevents.lk
                </a>
                <p className="text-body-sm text-pewter">Colombo, Sri Lanka</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-3 border-t border-white/[0.08]">
          <p className="text-caption text-pewter/50">
            © {new Date().getFullYear()} SNT Entertainments. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M13.5 21v-6.5H16l.4-2.8h-2.9v-1.8c0-.8.4-1.6 1.7-1.6h1.3V5.9s-1.2-.2-2.3-.2c-2.3 0-3.9 1.4-3.9 4v2h-2.6v2.8h2.6V21" />
    </svg>
  )
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path d="M14 4v9.5a3 3 0 1 1-2.4-2.94" />
      <path d="M14 4c.4 2.2 2 3.8 4.2 4.1" />
    </svg>
  )
}
