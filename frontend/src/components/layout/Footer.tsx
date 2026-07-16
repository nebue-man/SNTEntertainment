import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-pewter/20 px-6 py-14 md:px-10 md:py-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Image
            src="/logo-white.png"
            alt="SNT Events"
            width={80}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <p className="text-body-sm text-pewter max-w-xs">
            Sri Lanka&apos;s premier live music event company. We bring the best bands to iconic stages.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-col gap-3">
            {[
              { label: 'Home',            href: '/' },
              { label: 'Upcoming Events', href: '/events/upcoming' },
              { label: 'Past Events',     href: '/events/past' },
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
          <p className="text-caption text-pewter mt-4">
            Colombo, Sri Lanka
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-14 pt-8 border-t border-pewter/20">
        <p className="text-caption text-pewter/50">
          © {new Date().getFullYear()} SNT Live Events. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
