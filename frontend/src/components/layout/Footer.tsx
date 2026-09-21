'use client'
import React from 'react'
import type { SVGProps } from 'react'
import { useState } from 'react'

const SOCIAL_LINKS = [
  {
    label:      'WhatsApp',
    href:       'https://wa.me/94705542542',
    icon:       WhatsAppIcon,
    hoverColor: '#25D366',
    hoverBg:    'rgba(37,211,102,0.1)',
    glow:       'rgba(37,211,102,0.4)',
  },
  {
    label:      'Facebook',
    href:       'https://www.facebook.com/share/19XsPVGkZc/',
    icon:       FacebookIcon,
    hoverColor: '#1877F2',
    hoverBg:    'rgba(24,119,242,0.1)',
    glow:       'rgba(24,119,242,0.4)',
  },
  {
    label:      'Instagram',
    href:       'https://www.instagram.com/snt.entertainments?stkn=aTN2aWwxbGZnM2dv',
    icon:       InstagramIcon,
    hoverColor: '#E1306C',
    hoverBg:    'rgba(225,48,108,0.1)',
    glow:       'rgba(225,48,108,0.4)',
  },
  {
    label:      'TikTok',
    href:       'https://www.tiktok.com/@snt.entertainments?_r=1&_t=ZS-99ZxubCR1kO',
    icon:       TikTokIcon,
    hoverColor: '#ffffff',
    hoverBg:    'rgba(255,255,255,0.1)',
    glow:       'rgba(255,255,255,0.25)',
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
              fontWeight:    700,
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

            {/* Row 2 — Social icons + email: WhatsApp, Facebook, Instagram, Mail, TikTok */}
            <div className="flex items-center justify-center gap-x-7">
              {SOCIAL_LINKS.slice(0, 3).map((s) => (
                <SocialIcon key={s.label} {...s} />
              ))}
              <ContactItem
                label="info.sntentertainments@gmail.com"
                href="mailto:info.sntentertainments@gmail.com"
                icon={MailIcon}
              />
              {SOCIAL_LINKS.slice(3).map((s) => (
                <SocialIcon key={s.label} {...s} />
              ))}
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
  label, href, icon: Icon, hoverColor, hoverBg, glow,
}: {
  label:      string
  href:       string
  icon:       (props: SVGProps<SVGSVGElement>) => React.ReactElement
  hoverColor: string
  hoverBg:    string
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
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          44,
        height:         44,
        borderRadius:   10,
        background:     hovered ? hoverBg : 'rgba(255,255,255,0.06)',
        color:          hovered ? hoverColor : 'rgba(255,255,255,0.75)',
        filter:         hovered ? `drop-shadow(0 0 8px ${glow})` : 'none',
        transition:     'color 0.2s ease, background 0.2s ease, filter 0.2s ease',
      }}
    >
      <Icon style={{ width: 18, height: 18 }} />
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
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          44,
        height:         44,
        borderRadius:   10,
        background:     hovered ? 'rgba(211,253,80,0.1)' : 'rgba(255,255,255,0.06)',
        color:          hovered ? '#d3fd50' : 'rgba(255,255,255,0.75)',
        filter:         hovered ? 'drop-shadow(0 0 8px rgba(211,253,80,0.4))' : 'none',
        transition:     'color 0.2s ease, background 0.2s ease, filter 0.2s ease',
      }}
    >
      <Icon style={{ width: 18, height: 18 }} />
    </a>
  )
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.78a4.85 4.85 0 0 1-1.07-.09z" />
    </svg>
  )
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  )
}
