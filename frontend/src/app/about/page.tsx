import type { Metadata } from 'next'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import TeamMemberCard from '@/components/events/TeamMemberCard'
import GhostButton from '@/components/ui/GhostButton'
import { teamMembers } from '@/lib/teamConfig'

export const metadata: Metadata = { title: 'About Us' }

const coreValues = [
  { num: '01', name: 'Excellence',      desc: 'We strive for the highest standards in every event we produce.' },
  { num: '02', name: 'Integrity',       desc: 'We conduct our business with honesty, transparency, and professionalism.' },
  { num: '03', name: 'Innovation',      desc: 'We embrace creativity and modern event technologies to deliver unique experiences.' },
  { num: '04', name: 'Commitment',      desc: 'We are dedicated to meeting deadlines, budgets, and client expectations.' },
  { num: '05', name: 'Teamwork',        desc: 'We believe collaboration is the foundation of every successful event.' },
  { num: '06', name: 'Customer Focus',  desc: "Our clients' goals and satisfaction are at the heart of everything we do." },
  { num: '07', name: 'Safety',          desc: 'We prioritize the safety and well-being of our clients, audiences, and team.' },
]

const whyChoose = [
  'End-to-end event planning and production solutions.',
  'Experienced team with a proven record of successful event execution.',
  'Professional coordination of concerts, corporate events, and entertainment programs.',
  'High-quality production standards, including stage, sound, lighting, and event logistics.',
  'Creative concepts tailored to each client\'s requirements.',
  'Reliable project management with attention to every detail.',
  'Strong industry relationships with artists, entertainers, suppliers, and venues.',
  'Commitment to delivering memorable experiences on time and within budget.',
]

export default function AboutPage() {
  return (
    <div className="pb-24">
      <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>

        {/* ── Company History ──────────────────────────────────────────── */}
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Company History</p>
        </ScrollReveal>
        <SplitHeadline
          text="We build nights worth remembering."
          as="h1"
          className="text-ghost-white font-light mb-12 max-w-4xl"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        />

        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24 max-w-4xl">
            <p className="text-body text-pewter leading-relaxed">
              S N T Entertainments &amp; Management (Pvt) Ltd is a professional event production
              and entertainment management company dedicated to delivering exceptional events
              with creativity, precision, and excellence.
            </p>
            <p className="text-body text-pewter leading-relaxed">
              With extensive experience in managing hundreds of successful events, our team
              has built a reputation for professionalism, innovation, and flawless execution.
              We are committed to creating memorable experiences that leave a lasting
              impression on audiences and clients alike.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Mission & Vision ─────────────────────────────────────────── */}
        <div className="border-t border-pewter/20 pt-20 mb-20">
          <ScrollReveal>
            <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Mission &amp; Vision</p>
          </ScrollReveal>
          <SplitHeadline
            text="What we stand for."
            as="h2"
            className="text-ghost-white font-light mb-12"
            style={{ fontSize: 'var(--text-heading-sm)' }}
          />

          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div className="border border-pewter/20 p-8 md:p-10">
                <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Mission</p>
                <p className="text-body text-pewter leading-relaxed">
                  To deliver world-class event production and entertainment management services
                  by combining creativity, innovation, and operational excellence, ensuring every
                  event exceeds client expectations and creates unforgettable experiences.
                </p>
              </div>
              <div className="border border-pewter/20 p-8 md:p-10">
                <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Vision</p>
                <p className="text-body text-pewter leading-relaxed">
                  To become Sri Lanka&apos;s leading event production and entertainment management
                  company, recognized internationally for excellence, innovation, and delivering
                  extraordinary live experiences.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ── Core Values ──────────────────────────────────────────────── */}
        <div className="border-t border-pewter/20 pt-20 mb-20">
          <ScrollReveal>
            <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Core Values</p>
          </ScrollReveal>
          <SplitHeadline
            text="What drives us."
            as="h2"
            className="text-ghost-white font-light mb-12"
            style={{ fontSize: 'var(--text-heading-sm)' }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10 max-w-4xl">
            {coreValues.map((v, i) => (
              <ScrollReveal key={v.num} delay={i * 0.06}>
                <div className="flex gap-6">
                  <span
                    className="text-caption text-electric-lime tracking-widest font-light shrink-0"
                    style={{ marginTop: '3px' }}
                  >
                    {v.num}
                  </span>
                  <div>
                    <p className="text-body text-ghost-white font-light mb-1">{v.name}</p>
                    <p className="text-body-sm text-pewter leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* ── Why Choose SNT ───────────────────────────────────────────── */}
        <div className="border-t border-pewter/20 pt-20 mb-20">
          <ScrollReveal>
            <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Why Choose SNT</p>
          </ScrollReveal>
          <SplitHeadline
            text="Built to deliver."
            as="h2"
            className="text-ghost-white font-light mb-12"
            style={{ fontSize: 'var(--text-heading-sm)' }}
          />

          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-6 max-w-4xl">
              {whyChoose.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="text-electric-lime shrink-0" style={{ fontSize: '14px', marginTop: '3px' }}>✓</span>
                  <p className="text-body-sm text-pewter leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* ── Team ─────────────────────────────────────────────────────── */}
        <div className="border-t border-pewter/20 pt-20 mb-20">
          <ScrollReveal>
            <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Meet the leadership</p>
          </ScrollReveal>
          <SplitHeadline
            text="The people behind the sound."
            as="h2"
            className="text-ghost-white font-light mb-12"
            style={{ fontSize: 'var(--text-heading-sm)' }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {teamMembers.map((member, i) => (
              <ScrollReveal key={member.id} delay={i * 0.08}>
                <TeamMemberCard member={member} />
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="border-t border-pewter/20 pt-20 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <p className="text-body text-pewter max-w-sm">
              Interested in working with us or bringing an artist to Sri Lanka?
            </p>
            <GhostButton href="mailto:hello@sntevents.lk" variant="pill">
              Get in touch
            </GhostButton>
          </div>
        </ScrollReveal>

      </div>
    </div>
  )
}
