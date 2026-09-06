'use client'

import { motion, type Variants } from 'framer-motion'

interface Props {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  style?: React.CSSProperties
  once?: boolean
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const word: Variants = {
  hidden:  { opacity: 0, y: '115%' },
  visible: { opacity: 1, y: '0%', transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
}

export default function SplitHeadline({ text, as: Tag = 'h2', className = '', style, once = true }: Props) {
  const words = text.split(' ')
  return (
    <Tag
      className={`overflow-hidden ${className}`}
      aria-label={text}
      style={{ fontFamily: 'var(--font-display, var(--font-body))', ...style }}
    >
      <motion.span
        className="flex flex-wrap gap-x-[0.3em]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.5 }}
        variants={container}
        aria-hidden
      >
        {words.map((w, i) => (
          /* pb/mb pair reserves clearance for italic descenders (Cormorant Garamond g, y, p, q) */
          <span key={i} className="overflow-hidden inline-block pb-[0.18em] -mb-[0.18em]">
            <motion.span className="inline-block" variants={word}>
              {w}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
