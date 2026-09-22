import {
  ClipboardCheck,
  Users,
  CalendarCheck,
  SlidersHorizontal,
  Lightbulb,
  Target,
  Handshake,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'

const items: { text: string; icon: LucideIcon }[] = [
  { text: 'End-to-end event planning and production solutions.',                                      icon: ClipboardCheck     },
  { text: 'Experienced team with a proven record of successful event execution.',                     icon: Users              },
  { text: 'Professional coordination of concerts, corporate events, and entertainment programs.',     icon: CalendarCheck      },
  { text: 'High-quality production standards, including stage, sound, lighting, and event logistics.', icon: SlidersHorizontal },
  { text: "Creative concepts tailored to each client's requirements.",                                icon: Lightbulb          },
  { text: 'Reliable project management with attention to every detail.',                              icon: Target             },
  { text: 'Strong industry relationships with artists, entertainers, suppliers, and venues.',          icon: Handshake          },
  { text: 'Commitment to delivering memorable experiences on time and within budget.',                icon: Sparkles           },
]

export default function WhyChooseSNT() {
  return (
    <>
      <ScrollReveal>
        <p
          className="text-caption text-electric-lime tracking-widest uppercase mb-3 font-bold"
        >
          Built to deliver.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.05}>
        <p
          className="text-ghost-white font-bold mb-10"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        >
          Why Choose SNT
        </p>
      </ScrollReveal>
      <div className="grid grid-cols-2 gap-3 max-w-4xl">
        {items.map(({ text, icon: Icon }, i) => (
          <ScrollReveal key={i} delay={0.05 + i * 0.06} className="h-full">
            <div className="border border-pewter/20 p-4 h-full flex flex-col">
              <Icon size={20} className="text-electric-lime shrink-0" />
              <p className="text-body-sm text-ghost-white leading-relaxed mt-3 flex-1 text-justify">{text}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </>
  )
}
