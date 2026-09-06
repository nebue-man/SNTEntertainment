const CAPABILITIES = [
  'LIVE CONCERTS',
  'SOUND & LIGHTING',
  'ARTIST MANAGEMENT',
  'CORPORATE EVENTS',
  'ENTERTAINMENT PROGRAMS',
  'STAGE PRODUCTION',
  'EVENT LOGISTICS',
  'CREATIVE PRODUCTION',
]

const strip = CAPABILITIES.join('   ·   ')

export default function CapabilitiesMarquee() {
  return (
    <div
      className="overflow-hidden border-t border-b border-pewter/20 py-4"
      aria-hidden="true"
    >
      <div
        className="snt-marquee-track flex w-max"
        style={{ animation: 'snt-marquee 32s linear infinite' }}
      >
        <span
          className="shrink-0 whitespace-nowrap text-pewter tracking-widest uppercase select-none"
          style={{ fontSize: '10px', paddingRight: '6rem' }}
        >
          {strip}
        </span>
        <span
          className="shrink-0 whitespace-nowrap text-pewter tracking-widest uppercase select-none"
          style={{ fontSize: '10px', paddingRight: '6rem' }}
        >
          {strip}
        </span>
      </div>
    </div>
  )
}
