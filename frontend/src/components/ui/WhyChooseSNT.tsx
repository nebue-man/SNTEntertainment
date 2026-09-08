import ScrollReveal from '@/components/ui/ScrollReveal'

const items = [
  'End-to-end event planning and production solutions.',
  'Experienced team with a proven record of successful event execution.',
  'Professional coordination of concerts, corporate events, and entertainment programs.',
  'High-quality production standards, including stage, sound, lighting, and event logistics.',
  "Creative concepts tailored to each client's requirements.",
  'Reliable project management with attention to every detail.',
  'Strong industry relationships with artists, entertainers, suppliers, and venues.',
  'Commitment to delivering memorable experiences on time and within budget.',
]

export default function WhyChooseSNT() {
  return (
    <>
      <ScrollReveal>
        <p
          className="text-electric-lime tracking-widest uppercase mb-3"
          style={{ fontSize: 'var(--text-heading-sm)', fontWeight: 400 }}
        >
          Why Choose SNT
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.05}>
        <p
          className="text-ghost-white font-light mb-10"
          style={{
            fontSize: '1.3125rem',
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.02em',
          }}
        >
          Built to deliver.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 max-w-4xl">
          {items.map((item, i) => (
            <div key={i} className="flex gap-5 py-5 border-t border-pewter/20 items-start">
              <span
                className="shrink-0 text-electric-lime font-mono tracking-wider"
                style={{ fontSize: '10px', paddingTop: '3px' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-body-sm text-ghost-white leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </>
  )
}
