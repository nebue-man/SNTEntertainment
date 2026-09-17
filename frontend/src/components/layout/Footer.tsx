'use client'
import React from 'react'
import type { SVGProps } from 'react'
import { useState } from 'react'

const SOCIAL_LINKS = [
  {
    label:      'Instagram',
    href:       'https://www.instagram.com/snt.entertainments?stkn=aTN2aWwxbGZnM2dv',
    icon:       InstagramIcon,
    hoverColor: '#E1306C',
    glow:       'rgba(225,48,108,0.4)',
  },
  {
    label:      'Facebook',
    href:       'https://www.facebook.com/share/19XsPVGkZc/',
    icon:       FacebookIcon,
    hoverColor: '#1877F2',
    glow:       'rgba(24,119,242,0.4)',
  },
  {
    label:      'TikTok',
    href:       'https://www.tiktok.com/@snt.entertainments?_r=1&_t=ZS-99ZxubCR1kO',
    icon:       TikTokIcon,
    hoverColor: '#ffffff',
    glow:       'rgba(255,255,255,0.25)',
  },
  {
    label:      'WhatsApp',
    href:       'https://wa.me/94705542542',
    icon:       WhatsAppIcon,
    hoverColor: '#25D366',
    glow:       'rgba(37,211,102,0.4)',
  },
]


export default function Footer() {
  return (
    <footer className="relative">
      {/* Top lime glow — SNT signature, mirrors header underglow */}
      <div aria-hidden className="relative h-px w-full">
        <div
          style={{
            position:        'absolute',
            top:             0,
            left:            '50%',
            transform:       'translateX(-50%)',
            width:           'min(600px, 100vw)',
            height:          1,
            background:      'rgba(211,253,80,0.7)',
            boxShadow:       '0 0 16px 4px rgba(211,253,80,0.35), 0 0 48px 16px rgba(211,253,80,0.12), 0 0 80px 32px rgba(211,253,80,0.05)',
            maskImage:       'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
          }}
        />
      </div>

      <div
        style={{
          paddingLeft:   'var(--headline-padding-x)',
          paddingRight:  'var(--headline-padding-x)',
          paddingTop:    '3rem',
          paddingBottom: '3rem',
        }}
      >
        <div className="flex flex-col items-center gap-5">

          {/* Contact heading */}
          <p
            style={{
              fontSize:      '0.68rem',
              fontWeight:    400,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color:         'rgba(255,255,255,0.55)',
              fontFamily:    'var(--font-body)',
            }}
          >
            Contact Us
          </p>

          {/* Two-row contact layout */}
          <div className="flex flex-col items-center gap-3">

            {/* Row 1 — Hotline */}
            <HotlineRow />

            {/* Row 2 — Social icons + email */}
            <div className="flex items-center justify-center gap-x-7">
              {SOCIAL_LINKS.map((s) => (
                <SocialIcon key={s.label} {...s} />
              ))}
              <ContactItem
                label="info.sntentertainments@gmail.com"
                href="mailto:info.sntentertainments@gmail.com"
                icon={MailIcon}
              />
            </div>

          </div>

          {/* Dashed divider */}
          <div className="w-full" style={{ borderTop: '1px dashed rgba(255,255,255,0.11)' }} />

          {/* Copyright */}
          <p
            style={{
              fontSize:      '10px',
              letterSpacing: '0.05em',
              color:         'rgba(255,255,255,0.25)',
              fontFamily:    'var(--font-body)',
              textAlign:     'center',
            }}
          >
            © {new Date().getFullYear()} SNT Entertainments and Management (Pvt) Ltd. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  )
}

function SocialIcon({
  label, href, icon: Icon, hoverColor, glow,
}: {
  label:      string
  href:       string
  icon:       (props: SVGProps<SVGSVGElement>) => React.ReactElement
  hoverColor: string
  glow:       string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color:      hovered ? hoverColor : 'rgba(255,255,255,0.38)',
        filter:     hovered ? `drop-shadow(0 0 8px ${glow})` : 'none',
        transition: 'color 0.2s ease, filter 0.2s ease',
        display:    'flex',
      }}
    >
      <Icon style={{ width: 22, height: 22 }} />
    </a>
  )
}

function HotlineRow() {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="tel:+94705542542"
      aria-label="Call SNT hotline: +94 70 554 2542"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '0.6rem',
        minHeight:  '44px',
        textDecoration: 'none',
        color:      hovered ? 'var(--color-electric-lime)' : 'inherit',
        filter:     hovered ? 'drop-shadow(0 0 10px rgba(211,253,80,0.35))' : 'none',
        transition: 'color 0.2s ease, filter 0.2s ease',
      }}
    >
      <PhoneIcon
        style={{
          width:  18,
          height: 18,
          color:  hovered ? 'var(--color-electric-lime)' : 'var(--color-electric-lime)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize:      '0.68rem',
          fontWeight:    400,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color:         hovered ? 'var(--color-electric-lime)' : 'rgba(255,255,255,0.45)',
          fontFamily:    'var(--font-body)',
          transition:    'color 0.2s ease',
        }}
      >
        Hotline:
      </span>
      <span
        style={{
          fontSize:      '0.8rem',
          fontWeight:    300,
          letterSpacing: '0.08em',
          color:         hovered ? 'var(--color-electric-lime)' : 'rgba(255,255,255,0.82)',
          fontFamily:    'var(--font-body)',
          transition:    'color 0.2s ease',
        }}
      >
        +94 70 554 2542
      </span>
    </a>
  )
}

function ContactItem({
  label, href, icon: Icon,
}: {
  label: string
  href:  string
  icon:  (props: SVGProps<SVGSVGElement>) => React.ReactElement
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:      'flex',
        alignItems:   'center',
        color:        hovered ? 'var(--color-electric-lime)' : 'rgba(255,255,255,0.38)',
        filter:       hovered ? 'drop-shadow(0 0 8px rgba(211,253,80,0.4))' : 'none',
        transition:   'color 0.2s ease, filter 0.2s ease',
        minHeight:    '44px',
      }}
    >
      <Icon style={{ width: 22, height: 22 }} />
    </a>
  )
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M13.5 21v-6.5H16l.4-2.8h-2.9v-1.8c0-.8.4-1.6 1.7-1.6h1.3V5.9s-1.2-.2-2.3-.2c-2.3 0-3.9 1.4-3.9 4v2h-2.6v2.8h2.6V21" />
    </svg>
  )
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M14 4v9.5a3 3 0 1 1-2.4-2.94" />
      <path d="M14 4c.4 2.2 2 3.8 4.2 4.1" />
    </svg>
  )
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z" />
    </svg>
  )
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  )
}
