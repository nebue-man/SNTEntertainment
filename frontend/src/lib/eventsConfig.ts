import type { Event } from '@/lib/types'

export const upcomingEventsPlaceholder: Event[] = [
  {
    id: 'evt-upcoming-1',
    slug: 'sound-of-colombo-2026',
    title: 'Sound of Colombo 2026',
    eventDate: '2026-09-20T13:30:00.000Z',
    venue: 'Nelum Pokuna Amphitheatre, Colombo',
    description: 'Placeholder description — replace with real event details.',
    lineup: ['Band A', 'Band B', 'DJ Set'],
    status: 'UPCOMING',
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
    eventDate: '2026-10-05T14:30:00.000Z',
    venue: 'BMICH, Kandy',
    description: 'Placeholder description — replace with real event details.',
    lineup: ['Band C', 'Band D'],
    status: 'UPCOMING',
    ticketPhases: [
      { id: 'ph-4', name: 'Early Bird', price: 2000, currency: 'LKR', isActive: false, isSoldOut: true },
      { id: 'ph-5', name: 'Standard',   price: 3000, currency: 'LKR', isActive: true,  isSoldOut: false },
    ],
  },
  {
    id: 'evt-upcoming-3',
    slug: 'galle-groove-fest',
    title: 'Galle Groove Fest',
    eventDate: '2026-11-14T12:30:00.000Z',
    venue: 'Galle Face Green, Colombo',
    description: 'Placeholder description — replace with real event details.',
    lineup: ['Band E', 'Band F', 'Band G'],
    status: 'UPCOMING',
    ticketPhases: [
      { id: 'ph-6', name: 'General',    price: 1500, currency: 'LKR', isActive: true, isSoldOut: false },
      { id: 'ph-7', name: 'Premium',    price: 4500, currency: 'LKR', isActive: true, isSoldOut: false },
    ],
  },
  {
    id: 'evt-upcoming-4',
    slug: 'neon-nights-colombo',
    title: 'Neon Nights Colombo',
    eventDate: '2026-12-31T15:30:00.000Z',
    venue: 'Cinnamon Grand, Colombo',
    description: "New Year's Eve live music spectacular. Placeholder — replace with real event details.",
    lineup: ['Headliner TBC'],
    status: 'UPCOMING',
    ticketPhases: [
      { id: 'ph-8', name: 'Early Bird', price: 5000, currency: 'LKR', isActive: true, isSoldOut: false },
      { id: 'ph-9', name: 'Standard',   price: 7500, currency: 'LKR', isActive: false, isSoldOut: false },
    ],
  },
]
