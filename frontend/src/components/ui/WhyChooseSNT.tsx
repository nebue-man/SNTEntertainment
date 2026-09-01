import ScrollReveal from '@/components/ui/ScrollReveal'
import SplitHeadline from '@/components/ui/SplitHeadline'

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
        <p className="text-electric-lime tracking-widest uppercase mb-6" style={{ fontSize: 'var(--text-heading-sm)' }}>Why Choose SNT</p>
      </ScrollReveal>
      <SplitHeadline
        text="Built to deliver."
        as="h2"
        className="text-ghost-white font-light mb-6"
        style={{ fontSize: 'var(--text-caption)' }}
      />
      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-6 max-w-4xl">
          {items.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="text-electric-lime shrink-0" style={{ fontSize: '14px', marginTop: '3px' }}>✓</span>
              <p className="text-body-sm text-pewter leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </>
  )
}
