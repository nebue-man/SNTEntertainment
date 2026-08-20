'use client'

import { useState } from 'react'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import LogoSvg from '@/components/ui/LogoSvg'

// thin   — static, ghost-white text, no animation
// pill   — float + fly-in, ghost-white text, electric-lime logos, pill shape, 20% smaller dims
// accent — float + fly-in, electric-lime text, white logos, thin dims (same px/py/border/shape as thin)
type Variant = 'thin' | 'pill' | 'accent'

interface BaseProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never }
type LinkProps   = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>  & { href: string }
type Props = ButtonProps | LinkProps

// ── Logo fly-in marks ─────────────────────────────────────────────────────
// left/top — settled % position inside the clip container
// fromX/fromY — px offset placing the mark outside the button before animation
// delay — enter stagger (s); exit always fires without delay
const LOGO_MARKS = [
  { left: '4%',  top: '8%',  fromX: -140, fromY: -70, delay: 0     },
  { left: '53%', top: '4%',  fromX:   15, fromY: -85, delay: 0.06  },
  { left: '84%', top: '9%',  fromX:  190, fromY: -65, delay: 0.03  },
  { left: '88%', top: '53%', fromX:  190, fromY:  50, delay: 0.11  },
  { left: '54%', top: '60%', fromX:   15, fromY:  85, delay: 0.08  },
  { left: '7%',  top: '55%', fromX: -140, fromY:  55, delay: 0.15  },
  { left: '33%', top: '28%', fromX:  -55, fromY: -85, delay: 0.19  },
]

// Logo SVG color per animated variant
const LOGO_COLOR: Record<string, string> = {
  pill:   'var(--color-electric-lime)',
  accent: '#ffffff',
}

// Border-radius of the clip container must match the button shape so logos
// are clipped to the exact button outline
const CLIP_RADIUS: Record<string, string> = {
  pill:   'var(--radius-pill)',
  accent: '0px',
}

// Design spec (design.md — K72):
//   thin   — 1px Ghost White border, 0px radius, 34px h-pad, 14px v-pad
//   pill   — 3px Ghost White border, pill radius, 44px h-pad, 28px v-pad (–20%)
//   accent — same dims as thin, electric-lime text
function variantClasses(variant: Variant) {
  const base = 'inline-flex items-center justify-center focus:outline-none font-light tracking-widest uppercase'
  if (variant === 'thin') {
    return `${base} text-ghost-white text-body-sm transition-opacity hover:opacity-70 border border-ghost-white px-[34px] py-[14px] rounded-none`
  }
  if (variant === 'accent') {
    return `${base} text-electric-lime text-body-sm border border-ghost-white px-[34px] py-[14px] rounded-none`
  }
  // pill: 20% smaller (44→35px, 28→22px, 16px→13px, 3px→2px)
  return `${base} text-ghost-white text-[13px] border-[2px] border-ghost-white px-[35px] py-[22px] rounded-pill`
}

const FLOAT = { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } as const

export default function GhostButton({ variant = 'pill', className = '', children, ...props }: Props) {
  const [hovered, setHovered] = useState(false)
  const classes = `${variantClasses(variant)} ${className}`

  // ── Thin: completely static ───────────────────────────────────────────────
  if (variant === 'thin') {
    if ('href' in props && props.href) {
      const { href, ...rest } = props as LinkProps
      return <Link href={href} className={classes} {...rest}>{children}</Link>
    }
    return (
      <button type="button" className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    )
  }

  // ── pill + accent: idle float + hover logo fly-in ─────────────────────────
  //
  // DOM:
  //   motion.div   ← float bob
  //   └── Link/button (position:relative)
  //       ├── span  ← clip container (absolute inset-0, overflow:hidden,
  //       │           border-radius matched to button shape)
  //       │   └── motion.span × 7  ← logo marks
  //       └── span  ← label text (relative z-10)

  const logoColor   = LOGO_COLOR[variant]  ?? '#ffffff'
  const clipRadius  = CLIP_RADIUS[variant] ?? '0px'

  const logoClipContainer = (
    <span
      aria-hidden
      style={{
        position:     'absolute',
        inset:        0,
        overflow:     'hidden',
        borderRadius: clipRadius,
        pointerEvents:'none',
      }}
    >
      {LOGO_MARKS.map((mark, i) => (
        <motion.span
          key={i}
          style={{ position: 'absolute', left: mark.left, top: mark.top, display: 'block' }}
          initial={{ x: mark.fromX, y: mark.fromY, opacity: 0 }}
          animate={
            hovered
              ? { x: 0, y: 0, opacity: 0.38 }
              : { x: mark.fromX, y: mark.fromY, opacity: 0 }
          }
          transition={{
            duration: hovered ? 0.58 : 0.28,
            ease:     [0.22, 1, 0.36, 1],
            delay:    hovered ? mark.delay : 0,
          }}
        >
          <LogoSvg style={{ height: 18, width: 'auto', color: logoColor, display: 'block' }} />
        </motion.span>
      ))}
    </span>
  )

  const hoverHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  }

  if ('href' in props && props.href) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { href, onMouseEnter: _ome, onMouseLeave: _oml, ...rest } = props as LinkProps
    return (
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={FLOAT}
        style={{ display: 'inline-block', willChange: 'transform' }}
      >
        <Link href={href} className={`${classes} relative`} {...hoverHandlers} {...rest}>
          {logoClipContainer}
          <span className="relative z-10">{children}</span>
        </Link>
      </motion.div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onMouseEnter: _ome, onMouseLeave: _oml, ...restProps } = props as ButtonProps
  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={FLOAT}
      style={{ display: 'inline-block', willChange: 'transform' }}
    >
      <button
        type="button"
        className={`${classes} relative`}
        {...hoverHandlers}
        {...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {logoClipContainer}
        <span className="relative z-10">{children}</span>
      </button>
    </motion.div>
  )
}
