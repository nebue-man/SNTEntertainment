import type { Event } from '@/lib/types'

export const upcomingEventsPlaceholder: Event[] = [
  {
    id: 'evt-upcoming-1',
    slug: 'sound-of-colombo-2026',
    title: 'Sound of Colombo 2026',
    date: '2026-09-20T19:00:00+05:30',
    venue: 'Nelum Pokuna Amphitheatre, Colombo',
    description: 'Placeholder description — replace with real event details.',
    lineup: ['Band A', 'Band B', 'DJ Set'],
    status: 'upcoming',
    ticketPhases: [
      { id: 'ph-1', name: 'Early Bird', price: 2500, currency: 'LKR', isActive: true, isSoldOut: false },
      { id: 'ph-2', name: 'Standard',   price: 3500, currency: 'LKR', isActive: true, isSoldOut: false },
      { id: 'ph-3', name: 'VIP',        price: 6000, currency: 'LKR', isActive: false, isSoldOut: false },
    ],
  },
  {
    id: 'evt-upcoming-2',
    slug: 'bassline-kandy',
    title: 'Bassline Kandy',
    date: '2026-10-05T20:00:00+05:30',
    venue: 'BMICH, Kandy',
    description: 'Placeholder description — replace with real event details.',
    lineup: ['Band C', 'Band D'],
    status: 'upcoming',
    ticketPhases: [
      { id: 'ph-4', name: 'Early Bird', price: 2000, currency: 'LKR', isActive: false, isSoldOut: true },
      { id: 'ph-5', name: 'Standard',   price: 3000, currency: 'LKR', isActive: true,  isSoldOut: false },
    ],
  },
  {
    id: 'evt-upcoming-3',
    slug: 'galle-groove-fest',
    title: 'Galle Groove Fest',
    date: '2026-11-14T18:00:00+05:30',
    venue: 'Galle Face Green, Colombo',
    description: 'Placeholder description — replace with real event details.',
    lineup: ['Band E', 'Band F', 'Band G'],
    status: 'upcoming',
    ticketPhases: [
      { id: 'ph-6', name: 'General',    price: 1500, currency: 'LKR', isActive: true, isSoldOut: false },
      { id: 'ph-7', name: 'Premium',    price: 4500, currency: 'LKR', isActive: true, isSoldOut: false },
    ],
  },
  {
    id: 'evt-upcoming-4',
    slug: 'neon-nights-colombo',
    title: 'Neon Nights Colombo',
    date: '2026-12-31T21:00:00+05:30',
    venue: 'Cinnamon Grand, Colombo',
    description: "New Year's Eve live music spectacular. Placeholder — replace with real event details.",
    lineup: ['Headliner TBC'],
    status: 'upcoming',
    ticketPhases: [
      { id: 'ph-8', name: 'Early Bird', price: 5000, currency: 'LKR', isActive: true, isSoldOut: false },
      { id: 'ph-9', name: 'Standard',   price: 7500, currency: 'LKR', isActive: false, isSoldOut: false },
    ],
  },
]
