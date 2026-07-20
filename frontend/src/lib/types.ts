// ─── API response shapes ──────────────────────────────────────────────────────

export interface EventMedia {
  type: 'video' | 'photo'
  url: string
  thumbnail?: string
  alt: string
}

export interface TicketPhase {
  id: string
  name: string
  price: number
  currency: string
  isActive: boolean
  isSoldOut: boolean
}

export interface Event {
  id: string
  slug: string
  title: string
  date: string          // ISO 8601, e.g. "2026-09-20T19:00:00Z"
  venue: string
  description: string
  flyerUrl?: string
  lineup?: string[]
  status: 'upcoming' | 'past'
  media?: EventMedia[]
  ticketPhases?: TicketPhase[]
}

export interface TicketRequest {
  eventId: string
  phaseId: string
  email: string
}

export interface TicketRequestResponse {
  message: string
}

// ─── Real API response shapes (verified against live backend) ─────────────────

export interface ApiEventMedia {
  id: string
  type: 'PHOTO' | 'VIDEO'
  url: string
  sortOrder: number
}

export interface PastApiEvent {
  id: string
  slug: string
  title: string
  venue: string
  eventDate: string
  status: 'PAST'
  flyerUrl: string | null
  media: ApiEventMedia[]
  artists: { name: string; role: string }[]
}

export interface HeroVideoEntry {
  slotNumber: number
  videoUrl: string
}

// ─── Config / placeholder data shapes ────────────────────────────────────────

export interface HeroSlide {
  id: string
  type: 'video' | 'image'
  src: string
  alt: string
  label: string
}

export interface MediaItem {
  id: string
  type: 'video' | 'photo'
  src: string
  thumbnail?: string
  alt: string
  year: number
  eventTitle: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  photoSrc?: string
  bio: string
}
