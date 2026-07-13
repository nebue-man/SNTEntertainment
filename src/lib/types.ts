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
  lineup: string[]
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
