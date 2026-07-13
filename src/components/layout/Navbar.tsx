'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import GhostButton from '@/components/ui/GhostButton'
import AmbientClock from '@/components/layout/AmbientClock'

const navLinks = [
  { label: 'Home',            href: '/' },
  { label: 'Upcoming Events', href: '/events/upcoming' },
  { label: 'Past Events',     href: '/events/past' },
  { label: 'About Us',        href: '/about' },
]

const overlay: Variants = {
  closed: { opacity: 0 },
  open:   { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const linkContainer: Variants = {
  closed: {},
  open:   { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
}

const linkItem: Variants = {
  closed: { opacity: 0, x: 40 },
  open:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" onClick={() => setOpen(false)} aria-label="SNT home">
          <Image
            src="/logo-white.png"
            alt="SNT Events logo"
            width={80}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          <AmbientClock />
          <GhostButton
            variant="thin"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            Menu
          </GhostButton>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] bg-absolute-zero flex flex-col"
            variants={overlay}
            initial="closed"
            animate="open"
            exit="closed"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between px-6 py-4 md:px-10">
              <Link href="/" onClick={() => setOpen(false)} aria-label="SNT home">
                <Image
                  src="/logo-white.png"
                  alt="SNT Events logo"
                  width={80}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <GhostButton
                variant="thin"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                Fermer le menu
              </GhostButton>
            </div>

            <nav className="flex-1 flex flex-col justify-center px-6 md:px-10">
              <motion.ul
                className="list-none flex flex-col gap-2"
                variants={linkContainer}
                initial="closed"
                animate="open"
              >
                {navLinks.map(({ label, href }) => (
                  <motion.li key={href} variants={linkItem}>
                    <Link
                      href={href}
                      className="block text-ghost-white font-light leading-tight hover:text-electric-lime transition-colors"
                      style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>

            <div className="px-6 pb-6 md:px-10">
              <p className="text-caption text-pewter">
                © {new Date().getFullYear()} SNT Live Events. All rights reserved.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
