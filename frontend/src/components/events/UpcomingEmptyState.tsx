'use client'

import Link from 'next/link'
import type React from 'react'

// Fixed array — deterministic positions avoid hydration mismatches
const PARTICLES: { left: number; bot: number; dur: number; delay: number }[] = [
  { left:  6, bot:  8, dur: 5.2, delay: 0.0 },
  { left: 13, bot: 12, dur: 4.7, delay: 1.3 },
  { left: 21, bot:  5, dur: 6.1, delay: 2.8 },
  { left: 29, bot: 10, dur: 4.4, delay: 0.6 },
  { left: 37, bot:  7, dur: 7.2, delay: 3.5 },
  { left: 44, bot:  9, dur: 5.8, delay: 1.1 },
  { left: 50, bot:  6, dur: 4.9, delay: 2.2 },
  { left: 57, bot: 11, dur: 6.5, delay: 0.4 },
  { left: 64, bot:  8, dur: 5.3, delay: 3.8 },
  { left: 71, bot:  5, dur: 7.0, delay: 1.7 },
  { left: 78, bot: 13, dur: 4.6, delay: 0.9 },
  { left: 84, bot:  7, dur: 5.7, delay: 2.5 },
  { left: 90, bot:  9, dur: 6.8, delay: 3.2 },
  { left: 16, bot:  6, dur: 5.1, delay: 4.1 },
  { left: 46, bot: 10, dur: 7.5, delay: 0.2 },
  { left: 61, bot:  8, dur: 4.8, delay: 2.9 },
  { left: 75, bot:  5, dur: 6.3, delay: 1.5 },
  { left: 53, bot: 11, dur: 5.5, delay: 3.7 },
]

const STYLES = `
  @property --ues-ang {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }
  @keyframes ues-rotate  { to { --ues-ang: 360deg; } }
  @keyframes ues-breathe { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
  @keyframes ues-sweep   {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
  }
  @keyframes ues-rise {
    0%   { transform: translateY(0);      opacity: 0;    }
    15%  {                                opacity: 0.8;  }
    85%  {                                opacity: 0.45; }
    100% { transform: translateY(-180px); opacity: 0;    }
  }

  /* Static fallback border — always present, overridden below when conic-gradient is supported */
  .ues-wrap {
    border-radius: 16px;
    border: 1px solid rgba(211, 253, 80, 0.2);
    padding: 0;
  }
  @supports (background: conic-gradient(from 1turn, #000, #fff)) {
    .ues-wrap {
      border: none;
      padding: 1px;
      background: conic-gradient(
        from var(--ues-ang),
        transparent 0deg,
        #d3fd50 60deg,
        transparent 120deg,
        transparent 360deg
      );
      animation: ues-rotate 5s linear infinite;
    }
  }

  .ues-breathe { animation: ues-breathe 2.4s ease-in-out infinite; }
  .ues-sweep   { animation: ues-sweep   2.4s ease-in-out infinite; }
  .ues-rise    { animation: ues-rise var(--ues-dur, 5s) ease-in-out var(--ues-delay, 0s) infinite; }

  .ues-body {
    display: flex;
    flex-direction: row;
    gap: 28px;
    align-items: flex-start;
  }
  .ues-flyer {
    flex-shrink: 0;
    width: 200px;
  }
  @media (max-width: 639px) {
    .ues-body  { flex-direction: column; align-items: center; }
    .ues-flyer { width: min(220px, 100%); }
  }

  .ues-cta {
    display: inline-block;
    align-self: flex-start;
    padding: 10px 20px;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #d3fd50;
    background: transparent;
    border: 1px solid rgba(211, 253, 80, 0.33);
    border-radius: 9999px;
    transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }
  .ues-cta:hover {
    background: #d3fd50;
    color: #000;
    border-color: #d3fd50;
  }

  @media (prefers-reduced-motion: reduce) {
    .ues-wrap    { animation: none !important; background: none !important; border: 1px solid rgba(211,253,80,0.2) !important; }
    .ues-breathe,
    .ues-sweep,
    .ues-rise    { animation: none !important; }
  }
`

export default function UpcomingEmptyState() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        {/* Animated conic-gradient border ring */}
        <div className="ues-wrap" style={{ maxWidth: '880px', width: '100%' }}>

          {/* Inner card */}
          <div
            style={{
              background: '#0a0a0a',
              borderRadius: '15px',
              padding: '28px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Rising lime particles */}
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                className="ues-rise"
                aria-hidden
                style={{
                  position: 'absolute',
                  bottom: `${p.bot}%`,
                  left: `${p.left}%`,
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  background: '#d3fd50',
                  zIndex: 0,
                  '--ues-dur':   `${p.dur}s`,
                  '--ues-delay': `${p.delay}s`,
                } as React.CSSProperties}
              />
            ))}

            {/* Two-column layout (stacks on mobile via .ues-body media query) */}
            <div className="ues-body" style={{ position: 'relative', zIndex: 1 }}>

              {/* ── Mystery flyer ───────────────────────────────────── */}
              <div
                className="ues-flyer"
                style={{
                  aspectRatio: '3 / 4',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#111',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Blurred ambient glow layers */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    filter: 'blur(14px)',
                    background: [
                      'radial-gradient(circle at 20% 20%, rgba(211,253,80,0.33) 0%, transparent 60%)',
                      'radial-gradient(circle at 82% 80%, rgba(255,255,255,0.13) 0%, transparent 55%)',
                      'linear-gradient(160deg, #0c0c0c 0%, #181818 100%)',
                    ].join(', '),
                  }}
                />
                {/* Lock icon + label */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg
                    aria-hidden
                    focusable="false"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="ues-breathe"
                    style={{ color: '#d3fd50', display: 'block' }}
                  >
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                  </svg>
                  <span
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.25em',
                      color: 'rgba(255,255,255,0.65)',
                      textTransform: 'uppercase',
                    }}
                  >
                    CLASSIFIED
                  </span>
                </div>
              </div>

              {/* ── Text content ─────────────────────────────────────── */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {/* Headline */}
                <h3
                  style={{
                    fontSize: 'clamp(20px, 4vw, 28px)',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: '0.04em',
                    color: '#ffffff',
                    marginBottom: '14px',
                  }}
                >
                  THE COUNTDOWN BEGINS.
                </h3>

                {/* Subtext */}
                <p
                  style={{
                    fontSize: '15px',
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.6,
                    marginBottom: '8px',
                  }}
                >
                  Another unforgettable night. Another extraordinary experience.
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.6,
                  }}
                >
                  Your next S N T experience is coming soon. Are you ready?
                </p>

                {/* Loading bar */}
                <div
                  style={{
                    marginTop: '18px',
                    marginBottom: '22px',
                    height: '2px',
                    maxWidth: '260px',
                    background: '#1c1c1c',
                    borderRadius: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="ues-sweep"
                    style={{
                      width: '35%',
                      height: '100%',
                      background: '#d3fd50',
                      borderRadius: '1px',
                    }}
                  />
                </div>

                {/* CTA */}
                <Link
                  href="/events/past"
                  className="ues-cta"
                  aria-label="View past SNT events"
                >
                  VIEW PAST EVENTS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
