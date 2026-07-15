import HeroCarousel from '@/components/media/HeroCarousel'
import ScrollReveal from '@/components/ui/ScrollReveal'
import SplitHeadline from '@/components/ui/SplitHeadline'
import GhostButton from '@/components/ui/GhostButton'
import MediaCard from '@/components/media/MediaCard'
import FlyerCard from '@/components/events/FlyerCard'
import { heroSlides, featuredPastWork } from '@/lib/mediaConfig'
import { upcomingEventsPlaceholder } from '@/lib/eventsConfig'
import { getUpcomingEvents } from '@/lib/api'
import type { Event } from '@/lib/types'

async function fetchUpcoming(): Promise<Event[]> {
  try {
    return await getUpcomingEvents()
  } catch {
    return upcomingEventsPlaceholder
  }
}

export default async function Home() {
  const upcoming = await fetchUpcoming()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <HeroCarousel
        slides={heroSlides}
        heading="Sri Lanka Sounds Live"
        tagline="World-class live music, iconic venues, unforgettable nights."
      />

      {/* ── About teaser ──────────────────────────────────────── */}
      <section
        className="py-24 md:py-32 border-b border-pewter/20"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">About us</p>
        </ScrollReveal>
        <SplitHeadline
          text="We build nights worth remembering."
          as="h2"
          className="text-ghost-white font-light mb-8 max-w-3xl"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        />
        <ScrollReveal delay={0.2}>
          <p className="text-body text-pewter max-w-xl mb-10 leading-relaxed">
            SNT is Sri Lanka&apos;s premier live music event company. We partner with the
            island&apos;s top-tier bands and international acts to deliver electrifying
            experiences at iconic venues nationwide.
          </p>
          <GhostButton href="/about" variant="pill">
            Learn More
          </GhostButton>
        </ScrollReveal>
      </section>

      {/* ── Featured Past Work ────────────────────────────────── */}
      <section
        className="py-24 md:py-32 border-b border-pewter/20"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Past events</p>
        </ScrollReveal>
        <div className="flex items-end justify-between mb-10 gap-6">
          <SplitHeadline
            text="Our work speaks."
            as="h2"
            className="text-ghost-white font-light"
            style={{ fontSize: 'var(--text-heading-sm)' }}
          />
          <ScrollReveal delay={0.1}>
            <GhostButton href="/events/past" variant="thin">
              View All
            </GhostButton>
          </ScrollReveal>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredPastWork.slice(0, 4).map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.08}>
              <MediaCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Upcoming Events ───────────────────────────────────── */}
      <section
        className="py-24 md:py-32"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Upcoming events</p>
        </ScrollReveal>
        <div className="flex items-end justify-between mb-10 gap-6">
          <SplitHeadline
            text="What's next."
            as="h2"
            className="text-ghost-white font-light"
            style={{ fontSize: 'var(--text-heading-sm)' }}
          />
          <ScrollReveal delay={0.1}>
            <GhostButton href="/events/upcoming" variant="thin">
              All Events
            </GhostButton>
          </ScrollReveal>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {upcoming.slice(0, 4).map((event, i) => (
            <ScrollReveal key={event.id} delay={i * 0.08}>
              <FlyerCard event={event} />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  )
}
