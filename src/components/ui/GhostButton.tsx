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

function variantClasses(variant: Variant) {
  if (variant === 'thin') {
    return 'border border-ghost-white text-ghost-white px-6 py-0 rounded-none text-body font-light tracking-widest uppercase'
  }
  return 'border-[3px] border-ghost-white text-ghost-white px-7 pt-5 pb-0 rounded-pill text-body font-light tracking-widest uppercase'
}

export default function GhostButton({ variant = 'pill', className = '', children, ...props }: Props) {
  const classes = `inline-flex items-center justify-center transition-opacity hover:opacity-70 ${variantClasses(variant)} ${className}`

  if ('href' in props && props.href) {
    const { href, ...rest } = props as LinkProps
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
