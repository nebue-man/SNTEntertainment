'use client'

import { useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'

// Leaf paths — open C-curve (no Z close), branches toward the content area.
// Left vine leaves branch rightward; right vine leaves branch leftward.
// The open shape unfurls naturally as pathLength animates from 0→1.
function lLeaf(ax: number, ay: number) {
  return (
    `M ${ax} ${ay}` +
    ` C ${ax + 2} ${ay - 8} ${ax + 13} ${ay - 6} ${ax + 13} ${ay + 2}` +
    ` C ${ax + 13} ${ay + 10} ${ax + 2} ${ay + 11} ${ax} ${ay + 5}`
  )
}
function rLeaf(ax: number, ay: number) {
  return (
    `M ${ax} ${ay}` +
    ` C ${ax - 2} ${ay - 8} ${ax - 13} ${ay - 6} ${ax - 13} ${ay + 2}` +
    ` C ${ax - 13} ${ay + 10} ${ax - 2} ${ay + 11} ${ax} ${ay + 5}`
  )
}

const STROKE = {
  fill:           'none',
  stroke:         'var(--color-electric-lime)',
  strokeWidth:    1,
  strokeLinecap:  'round'              as const,
  strokeLinejoin: 'round'              as const,
  vectorEffect:   'non-scaling-stroke' as const,
}

// Scroll-progress midpoints at which each leaf is fully drawn.
const LP = [0.15, 0.33, 0.52, 0.69, 0.85] as const

export default function ScrollLines() {
  const [vh, setVh] = useState(800)
  useEffect(() => {
    const fn = () => setVh(window.innerHeight)
    fn()
    window.addEventListener('resize', fn, { passive: true })
    return () => window.removeEventListener('resize', fn)
  }, [])

  const { scrollYProgress } = useScroll()

  // Five leaf pathLength MotionValues — hooks must live at the top level.
  // Each leaf draws in over a ~10% scroll window centred on its LP value.
  const pl0 = useTransform(scrollYProgress, [LP[0] - 0.03, LP[0] + 0.07], [0, 1])
  const pl1 = useTransform(scrollYProgress, [LP[1] - 0.03, LP[1] + 0.07], [0, 1])
  const pl2 = useTransform(scrollYProgress, [LP[2] - 0.03, LP[2] + 0.07], [0, 1])
  const pl3 = useTransform(scrollYProgress, [LP[3] - 0.03, LP[3] + 0.07], [0, 1])
  const pl4 = useTransform(scrollYProgress, [LP[4] - 0.03, LP[4] + 0.07], [0, 1])
  const leafLengths = [pl0, pl1, pl2, pl3, pl4]

  // Left stem — S-curve: starts x=22, swings to x=16 at 22%, back to x=24 at 52%,
  // then to x=16 at 80%, settles at x=20. Leaves branch rightward.
  const leftStem =
    `M 22 0` +
    ` C 22 ${vh * 0.05} 14 ${vh * 0.12} 16 ${vh * 0.22}` +
    ` C 18 ${vh * 0.32} 26 ${vh * 0.40} 24 ${vh * 0.52}` +
    ` C 22 ${vh * 0.62} 14 ${vh * 0.68} 16 ${vh * 0.80}` +
    ` C 18 ${vh * 0.88} 22 ${vh * 0.95} 20 ${vh}`

  const leftLeaves = [
    lLeaf(20, vh * 0.15),
    lLeaf(17, vh * 0.33),
    lLeaf(23, vh * 0.52),
    lLeaf(18, vh * 0.69),
    lLeaf(17, vh * 0.85),
  ]

  // Right stem — mirror: starts x=18, swings to x=24 at 22%, back to x=16 at 52%,
  // then to x=24 at 80%, settles at x=20. Leaves branch leftward.
  const rightStem =
    `M 18 0` +
    ` C 18 ${vh * 0.05} 26 ${vh * 0.12} 24 ${vh * 0.22}` +
    ` C 22 ${vh * 0.32} 14 ${vh * 0.40} 16 ${vh * 0.52}` +
    ` C 18 ${vh * 0.62} 26 ${vh * 0.68} 24 ${vh * 0.80}` +
    ` C 22 ${vh * 0.88} 18 ${vh * 0.95} 20 ${vh}`

  const rightLeaves = [
    rLeaf(20, vh * 0.15),
    rLeaf(23, vh * 0.33),
    rLeaf(17, vh * 0.52),
    rLeaf(22, vh * 0.69),
    rLeaf(23, vh * 0.85),
  ]

  const svgCss: React.CSSProperties = {
    position:      'fixed',
    top:           0,
    width:         40,
    height:        '100lvh',
    pointerEvents: 'none',
    zIndex:        2,
    overflow:      'visible',
  }

  function vine(stem: string, leaves: string[], side: 'left' | 'right') {
    return (
      <svg
        aria-hidden="true"
        viewBox={`0 0 40 ${vh}`}
        width="40"
        style={{ ...svgCss, [side]: 8 }}
        className="hidden lg:block"
      >
        <motion.path
          d={stem}
          {...STROKE}
          style={{ pathLength: scrollYProgress, opacity: 0.3 }}
        />
        {leaves.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            {...STROKE}
            style={{ pathLength: leafLengths[i], opacity: 0.22 }}
          />
        ))}
      </svg>
    )
  }

  return (
    <>
      {vine(leftStem, leftLeaves, 'left')}
      {vine(rightStem, rightLeaves, 'right')}
    </>
  )
}
