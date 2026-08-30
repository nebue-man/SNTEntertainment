'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Ticket } from 'lucide-react'

// Strong ease-out per Emil Kowalski's animation philosophy
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function AllEventsButton({ href = '/events/upcoming' }: { href?: string }) {
  const [hovered, setHovered] = useState(false)
  const reduce = useReducedMotion()

  return (
    // Press: scale(0.97) with spring — instant tactile feedback, sub-300ms
    <motion.div
      whileTap={{ scale: reduce ? 1 : 0.97 }}
      transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
      style={{ display: 'inline-block' }}
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d3fd50] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        style={{
          fontFamily:      'var(--font-body)',
          fontSize:        'var(--text-body-sm)',
          letterSpacing:   '0.12em',
          textTransform:   'uppercase',
          color:           'var(--color-electric-lime)',
          padding:         '14px 34px',
          border:          '1px solid',
          // Border brightens on hover — color-only transition stays off the layout thread
          borderColor:     hovered ? 'var(--color-electric-lime)' : 'rgba(255,255,255,0.45)',
          background:      hovered ? 'rgba(211, 253, 80, 0.04)' : 'transparent',
          transition:      'border-color 150ms cubic-bezier(0.23, 1, 0.32, 1), background 150ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <span>All Events</span>

        {/* Ticket icon slides right 4px on hover — transform-only, ease-out, 150ms */}
        <motion.span
          animate={{ x: hovered && !reduce ? 4 : 0 }}
          transition={{ duration: 0.15, ease: EASE_OUT }}
          style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}
          aria-hidden="true"
        >
          <Ticket size={15} strokeWidth={1.5} />
        </motion.span>
      </Link>
    </motion.div>
  )
}
