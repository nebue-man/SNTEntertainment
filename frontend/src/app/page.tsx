import Link from 'next/link'
import { Play } from 'lucide-react'
import HeroIntro from '@/components/media/HeroIntro'
import ScrollReveal from '@/components/ui/ScrollReveal'
import SplitHeadline from '@/components/ui/SplitHeadline'
import GhostButton from '@/components/ui/GhostButton'
import FlyerCard from '@/components/events/FlyerCard'
import { upcomingEventsPlaceholder } from '@/lib/eventsConfig'
import { getUpcomingEvents, getHeroVideos, getPastEventsWithMedia } from '@/lib/api'
import type { Event, HeroSlide, PastApiEvent } from '@/lib/types'
import { resolveMediaUrl } from '@/lib/mediaUrl'

async function fetchUpcoming(): Promise<Event[]> {
  try {
    return await getUpcomingEvents()
  } catch {
    return upcomingEventsPlaceholder
  }
}

async function fetchHeroSlides(): Promise<HeroSlide[]> {
  try {
    const slots = await getHeroVideos()
    return slots.map((s) => ({
      id: String(s.slotNumber),
      type: 'video' as const,
      src: resolveMediaUrl(s.videoUrl),
      alt: `Hero video ${s.slotNumber}`,
      label: '',
    }))
  } catch {
    return []
  }
}

async function fetchPastFeatured(): Promise<PastApiEvent[]> {
  try {
    const events = await getPastEventsWithMedia()
    return events
      .slice()
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
      .slice(0, 4)
  } catch {
    return []
  }
}

export default async function Home() {
  const [upcoming, heroSlides, pastFeatured] = await Promise.all([
    fetchUpcoming(),
    fetchHeroSlides(),
    fetchPastFeatured(),
  ])

  return (
    <>
      {/* ── Hero intro — scroll-driven logo transition + video reveal ── */}
      <HeroIntro
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
      {pastFeatured.length > 0 && (
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
            {pastFeatured.map((event, i) => {
              const coverPhoto = event.media
                .filter((m) => m.type === 'PHOTO')
                .sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null
              const hasVideo = event.media.some((m) => m.type === 'VIDEO')
              const year = new Date(event.eventDate).getFullYear()

              return (
                <ScrollReveal key={event.id} delay={i * 0.08}>
                  <Link
                    href={`/events/past?event=${event.slug}`}
                    className="group relative w-full border border-pewter/20 hover:border-ghost-white/60 transition-colors duration-300 overflow-hidden block"
                    aria-label={`View ${event.title} gallery`}
                  >
                    <div className="aspect-video relative">
                      {coverPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveMediaUrl(coverPhoto.url)}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-[#161616] flex items-center justify-center">
                          <span className="text-pewter/30 text-[10px] tracking-widest uppercase">No Photos</span>
                        </div>
                      )}
                      {hasVideo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border border-ghost-white flex items-center justify-center bg-absolute-zero/60 group-hover:bg-electric-lime/20 transition-colors">
                            <Play size={20} className="text-ghost-white ml-1" fill="white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-pewter/20">
                      <p className="text-body-sm text-ghost-white truncate">{event.title}</p>
                      <p className="text-caption text-pewter">{year}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </section>
      )}

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
