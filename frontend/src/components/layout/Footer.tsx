import Link from 'next/link'
import LogoSvg from '@/components/ui/LogoSvg'

export default function Footer() {
  return (
    <footer className="border-t border-pewter/20 px-6 pt-4 pb-[64px] md:px-10 md:pt-6 md:pb-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
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
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-col gap-2">
            {[
              { label: 'Home',            href: '/' },
              { label: 'Upcoming Event', href: '/events/upcoming' },
              { label: 'Past Event',     href: '/events/past' },
              { label: 'About Us',        href: '/about' },
            ].map(({ label, href }) => (
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

        <div className="flex flex-col gap-2">
          <p className="text-body-sm text-pewter">Get in touch</p>
          <a
            href="mailto:hello@sntevents.lk"
            className="text-body-sm text-ghost-white hover:text-electric-lime transition-colors"
          >
            hello@sntevents.lk
          </a>
          <p className="text-caption text-pewter mt-1">
            Colombo, Sri Lanka
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-pewter/20">
        <p className="text-caption text-pewter/50">
          © {new Date().getFullYear()} SNT Live Events. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
