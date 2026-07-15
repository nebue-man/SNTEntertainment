import type { Metadata } from 'next'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import TeamMemberCard from '@/components/events/TeamMemberCard'
import GhostButton from '@/components/ui/GhostButton'
import { teamMembers } from '@/lib/teamConfig'

export const metadata: Metadata = { title: 'About Us' }

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>

        {/* Story */}
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Our story</p>
        </ScrollReveal>
        <SplitHeadline
          text="Born from a love of live music."
          as="h1"
          className="text-ghost-white font-light mb-12 max-w-4xl"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        />

        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24 max-w-4xl">
            <p className="text-body text-pewter leading-relaxed">
              SNT was founded with a single belief: that Sri Lanka deserves world-class live
              music experiences. From intimate club nights to stadium spectacles, we&apos;ve
              spent years building relationships with the finest bands and most iconic venues
              across the island.
            </p>
            <p className="text-body text-pewter leading-relaxed">
              Our team handles everything — from artist booking and stage production to
              ticketing logistics and crowd experience — so the night you attend is flawless
              from the first note to the last.
            </p>
          </div>
        </ScrollReveal>

        {/* Team */}
        <div className="border-t border-pewter/20 pt-20 mb-20">
          <ScrollReveal>
            <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">The team</p>
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

        {/* CTA */}
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
