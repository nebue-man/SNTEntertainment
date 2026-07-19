import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

type Variant = 'thin' | 'pill'

interface BaseProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never }
type LinkProps   = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>  & { href: string }

type Props = ButtonProps | LinkProps

// Design spec (design.md — K72):
//   thin  — 1px Ghost White border, 0px radius, 25px h-pad, 0px v-pad
//   pill  — 3px Ghost White border, pill radius, 28px h-pad, ~21px v-pad
function variantClasses(variant: Variant) {
  const shared = 'inline-flex items-center justify-center transition-opacity hover:opacity-70 focus:outline-none text-body-sm font-light tracking-widest uppercase text-ghost-white'
  if (variant === 'thin') {
    return `${shared} border border-ghost-white px-[34px] py-[14px] rounded-none`
  }
  return `${shared} border-[3px] border-ghost-white px-[44px] py-[28px] rounded-pill`
}

export default function GhostButton({ variant = 'pill', className = '', children, ...props }: Props) {
  const classes = `${variantClasses(variant)} ${className}`

  if ('href' in props && props.href) {
    const { href, ...rest } = props as LinkProps
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    // appearance-none in globals.css handles UA chrome; explicit bg-transparent + border
    // here makes the element own all visible styling with no UA interference
    <button
      type="button"
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
