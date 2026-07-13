# SNT Live Events — Phase 1 Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 15 App Router + Tailwind CSS v4 portfolio + ticket-request website for a Sri Lankan live music events company, consuming a Node/Express/PostgreSQL backend API.

**Architecture:** Server components fetch event data from the API and pass it to client components for interactivity (filters, ticket modals, lightbox). Placeholder media/team/event config files act as swappable data sources so the site works before the backend and real assets exist. The design system is K72-inspired: black canvas, white type, electric-lime accent, Lausanne typeface, full-screen menu overlay, Lenis smooth scroll, GSAP ScrollTrigger headline reveals, and a custom cursor.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion (carousel + modal + page transitions), Lenis (smooth scroll), GSAP + ScrollTrigger (headline splits + scroll choreography), React Testing Library + Jest (unit tests), Lucide React (minimal icons).

---

## File Map

```
/Users/dilshan/Documents/SNT/
├── public/
│   ├── logo-white.png          # copy of "Logo white.png"
│   └── logo-black.png          # copy of "Logo black.png"
├── src/
│   ├── app/
│   │   ├── layout.tsx           # root layout: providers, Navbar, Footer, cursor, clock
│   │   ├── page.tsx             # Home "/"
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── events/
│   │       ├── past/
│   │       │   └── page.tsx
│   │       ├── upcoming/
│   │       │   └── page.tsx
│   │       └── [slug]/
│   │           ├── page.tsx
│   │           └── loading.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx           # full-screen menu overlay + stagger links
│   │   │   ├── Footer.tsx
│   │   │   ├── CustomCursor.tsx     # dot cursor, scales on hover
│   │   │   ├── AmbientClock.tsx     # live city + clock label
│   │   │   └── SmoothScrollProvider.tsx  # Lenis wrapper
│   │   ├── ui/
│   │   │   ├── GhostButton.tsx      # thin-border + thick-pill variants
│   │   │   ├── PlaceholderMedia.tsx # labeled bordered placeholder box
│   │   │   ├── ScrollReveal.tsx     # Framer Motion viewport scroll reveal
│   │   │   └── SplitHeadline.tsx    # GSAP word-split stagger headline
│   │   ├── media/
│   │   │   ├── HeroCarousel.tsx     # autoplay video/image slides
│   │   │   └── MediaCard.tsx        # past-event video/photo card with lightbox trigger
│   │   └── events/
│   │       ├── FlyerCard.tsx        # upcoming event flyer card
│   │       ├── EventFilter.tsx      # year + type filter for past events
│   │       ├── EventsGallery.tsx    # client: masonry grid + filter + lightbox
│   │       ├── Lightbox.tsx         # modal lightbox with video playback
│   │       ├── TicketPhaseCard.tsx  # selectable ticket phase card
│   │       ├── EmailCaptureModal.tsx # email form + confirmation
│   │       └── TeamMemberCard.tsx   # photo placeholder + name + role
│   └── lib/
│       ├── types.ts             # all shared TypeScript interfaces
│       ├── api.ts               # typed fetch wrappers for all endpoints
│       ├── mediaConfig.ts       # swappable hero slides + featured past work
│       ├── eventsConfig.ts      # placeholder upcoming + past event arrays
│       └── teamConfig.ts        # placeholder team member array
├── styles/
│   └── globals.css              # @import tailwindcss, @theme block, base styles
├── .env.local                   # NEXT_PUBLIC_API_URL=http://localhost:4000
├── jest.config.ts
├── jest.setup.ts
├── postcss.config.mjs
└── next.config.ts
```

---

## Task 1: Scaffold Next.js Project + Install Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `postcss.config.mjs`, `.env.local`, `tsconfig.json`
- Create: `public/logo-white.png`, `public/logo-black.png`

- [ ] **Step 1: Scaffold Next.js app into existing directory**

```bash
cd /Users/dilshan/Documents/SNT
npx create-next-app@latest . \
  --typescript \
  --app \
  --src-dir \
  --no-tailwind \
  --eslint \
  --turbopack \
  --import-alias "@/*"
```

When prompted "The directory is not empty. Would you like to continue?" → **Yes**.

- [ ] **Step 2: Install Tailwind CSS v4**

```bash
npm install tailwindcss @tailwindcss/postcss
```

- [ ] **Step 3: Install animation + scroll libraries**

```bash
npm install framer-motion lenis gsap @gsap/react lucide-react
npm install --save-dev @types/gsap
```

- [ ] **Step 4: Install test tooling**

```bash
npm install --save-dev jest jest-environment-jsdom @jest/globals \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  ts-jest @types/jest babel-jest
```

- [ ] **Step 5: Write `postcss.config.mjs`**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
export default config
```

- [ ] **Step 6: Write `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 7: Write `.env.local`**

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

- [ ] **Step 8: Copy logos into public/**

```bash
cp "/Users/dilshan/Documents/SNT/Logo white.png" /Users/dilshan/Documents/SNT/public/logo-white.png
cp "/Users/dilshan/Documents/SNT/Logo black.png" /Users/dilshan/Documents/SNT/public/logo-black.png
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: "Ready on http://localhost:3000" with no errors.

- [ ] **Step 10: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 15 + Tailwind v4 + animation stack"
```

---

## Task 2: Jest + React Testing Library Setup

**Files:**
- Create: `jest.config.ts`, `jest.setup.ts`
- Modify: `tsconfig.json` (add jest types)

- [ ] **Step 1: Write `jest.config.ts`**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
}

export default createJestConfig(config)
```

- [ ] **Step 2: Write `jest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test scripts to `package.json`**

Open `package.json` and add to the `"scripts"` block:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

- [ ] **Step 4: Verify jest runs without error**

```bash
npm test -- --passWithNoTests
```

Expected: "Test Suites: 0 passed".

- [ ] **Step 5: Commit**

```bash
git add jest.config.ts jest.setup.ts package.json
git commit -m "chore: add Jest + React Testing Library"
```

---

## Task 3: CSS Design System

**Files:**
- Create: `src/styles/globals.css`
- Modify: `src/app/layout.tsx` (import globals.css — placeholder, will be replaced in Task 14)

- [ ] **Step 1: Delete the default `app/globals.css` created by create-next-app**

```bash
rm -f src/app/globals.css
```

- [ ] **Step 2: Write `src/styles/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-absolute-zero: #000000;
  --color-ghost-white: #ffffff;
  --color-pewter: #4d4d4d;
  --color-electric-lime: #d3fd50;

  --font-lausanne: 'Lausanne', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --text-caption: 11px;
  --text-body-sm: 14px;
  --text-body: 16px;
  --text-body-lg: 20px;
  --text-heading-sm: 35px;
  --text-heading: clamp(2.5rem, 8vw, 5.875rem);
  --text-heading-lg: clamp(3rem, 10vw, 7.1875rem);
  --text-display-sm: clamp(2.5rem, 11vw, 8.5625rem);

  --radius-full: 34965px;
  --radius-pill: 93506.4px;
}

:root {
  --color-absolute-zero: #000000;
  --color-ghost-white: #ffffff;
  --color-pewter: #4d4d4d;
  --color-electric-lime: #d3fd50;

  --font-lausanne: 'Lausanne', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --section-gap: clamp(1.5rem, 4vw, 2.5rem);
  --card-padding: 28px;
  --element-gap: 10px;
  --headline-padding-x: clamp(1.25rem, 10vw, 9rem);
}

/*
  Lausanne @font-face — drop your .woff2 files into public/fonts/
  and uncomment these rules. Until then, system-ui is the fallback.

  @font-face {
    font-family: 'Lausanne';
    src: url('/fonts/Lausanne-300.woff2') format('woff2');
    font-weight: 300;
    font-display: swap;
  }
  @font-face {
    font-family: 'Lausanne';
    src: url('/fonts/Lausanne-400.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
  }
*/

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background-color: var(--color-absolute-zero);
  color: var(--color-ghost-white);
  font-family: var(--font-lausanne);
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
  cursor: none;
}

body {
  min-height: 100vh;
  overflow-x: hidden;
}

/* hide default cursor site-wide; CustomCursor renders its own */
*, *::before, *::after {
  cursor: none !important;
}

@media (pointer: coarse) {
  /* restore cursor on touch devices — CustomCursor hides itself there */
  *, *::before, *::after {
    cursor: auto !important;
  }
}

a, button { cursor: none !important; }
```

- [ ] **Step 3: Update the temporary `src/app/layout.tsx` import path**

Find the line `import './globals.css'` that create-next-app generated and change it to:

```ts
import '@/styles/globals.css'
```

- [ ] **Step 4: Verify build compiles**

```bash
npm run build
```

Expected: build succeeds with no Tailwind or CSS errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css src/app/layout.tsx
git commit -m "feat: add K72-derived CSS design system with Tailwind v4 @theme"
```

---

## Task 4: Shared TypeScript Types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write `src/lib/types.ts`**

```ts
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
  label: string         // human-readable "Past Event Video — replace with client asset"
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
  photoSrc?: string     // leave undefined until real photos supplied
  bio: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 5: API Fetch Library + Tests

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/__tests__/lib/api.test.ts`

- [ ] **Step 1: Write failing tests for `api.ts`**

Create `src/__tests__/lib/api.test.ts`:

```ts
import { getUpcomingEvents, getPastEvents, getEvent, createTicketRequest } from '@/lib/api'

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  process.env.NEXT_PUBLIC_API_URL = 'http://test-api.local'
})

function ok(body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
}
function err(status: number, message: string) {
  return Promise.resolve(new Response(JSON.stringify({ message }), { status }))
}

describe('getUpcomingEvents', () => {
  it('fetches /api/events?status=upcoming', async () => {
    mockFetch.mockReturnValue(ok([{ id: '1', slug: 'test', title: 'T', status: 'upcoming' }]))
    const result = await getUpcomingEvents()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.local/api/events?status=upcoming',
      expect.objectContaining({ headers: expect.any(Object) })
    )
    expect(result[0].slug).toBe('test')
  })
})

describe('getPastEvents', () => {
  it('fetches /api/events?status=past', async () => {
    mockFetch.mockReturnValue(ok([]))
    await getPastEvents()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.local/api/events?status=past',
      expect.any(Object)
    )
  })
})

describe('getEvent', () => {
  it('fetches /api/events/:slug', async () => {
    mockFetch.mockReturnValue(ok({ id: '1', slug: 'my-event' }))
    const result = await getEvent('my-event')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.local/api/events/my-event',
      expect.any(Object)
    )
    expect(result.slug).toBe('my-event')
  })
})

describe('createTicketRequest', () => {
  it('POSTs to /api/ticket-requests', async () => {
    mockFetch.mockReturnValue(new Response(JSON.stringify({ message: 'ok' }), { status: 201 }))
    const result = await createTicketRequest({ eventId: 'e1', phaseId: 'p1', email: 'a@b.com' })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.local/api/ticket-requests',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ eventId: 'e1', phaseId: 'p1', email: 'a@b.com' }) })
    )
    expect(result.message).toBe('ok')
  })

  it('throws on 400', async () => {
    mockFetch.mockReturnValue(err(400, 'Invalid phase'))
    await expect(createTicketRequest({ eventId: 'e1', phaseId: 'p1', email: 'bad' }))
      .rejects.toThrow('Invalid phase')
  })

  it('throws on 409 sold out', async () => {
    mockFetch.mockReturnValue(err(409, 'Phase sold out'))
    await expect(createTicketRequest({ eventId: 'e1', phaseId: 'p1', email: 'a@b.com' }))
      .rejects.toThrow('Phase sold out')
  })
})
```

- [ ] **Step 2: Run tests — expect them to fail**

```bash
npm test -- src/__tests__/lib/api.test.ts
```

Expected: FAIL — `getUpcomingEvents` not found.

- [ ] **Step 3: Write `src/lib/api.ts`**

```ts
import type { Event, TicketRequest, TicketRequestResponse } from '@/lib/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error((body as { message?: string }).message ?? `HTTP ${res.status}`) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return res.json() as Promise<T>
}

export const getUpcomingEvents = () =>
  apiFetch<Event[]>('/api/events?status=upcoming')

export const getPastEvents = () =>
  apiFetch<Event[]>('/api/events?status=past')

export const getEvent = (slug: string) =>
  apiFetch<Event>(`/api/events/${slug}`)

export const createTicketRequest = (body: TicketRequest) =>
  apiFetch<TicketRequestResponse>('/api/ticket-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  })
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/__tests__/lib/api.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api.ts src/__tests__/lib/api.test.ts
git commit -m "feat: add typed API fetch library with tests"
```

---

## Task 6: Placeholder Config Data

**Files:**
- Create: `src/lib/mediaConfig.ts`
- Create: `src/lib/eventsConfig.ts`
- Create: `src/lib/teamConfig.ts`

- [ ] **Step 1: Write `src/lib/mediaConfig.ts`**

```ts
import type { HeroSlide, MediaItem } from '@/lib/types'

export const heroSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    type: 'video',
    src: '',
    alt: 'Hero slide 1',
    label: 'Hero Video 1 — replace with client asset (16:9 video, full-bleed)',
  },
  {
    id: 'hero-2',
    type: 'image',
    src: '',
    alt: 'Hero slide 2',
    label: 'Hero Image 2 — replace with client asset (16:9 landscape)',
  },
  {
    id: 'hero-3',
    type: 'video',
    src: '',
    alt: 'Hero slide 3',
    label: 'Hero Video 3 — replace with client asset (16:9 video, full-bleed)',
  },
  {
    id: 'hero-4',
    type: 'image',
    src: '',
    alt: 'Hero slide 4',
    label: 'Hero Image 4 — replace with client asset (16:9 landscape)',
  },
]

export const featuredPastWork: MediaItem[] = [
  {
    id: 'featured-1',
    type: 'video',
    src: '',
    thumbnail: '',
    alt: 'Featured past event 1',
    year: 2025,
    eventTitle: 'Past Event 1 — replace with client asset',
  },
  {
    id: 'featured-2',
    type: 'photo',
    src: '',
    alt: 'Featured past event 2',
    year: 2025,
    eventTitle: 'Past Event 2 — replace with client asset',
  },
  {
    id: 'featured-3',
    type: 'video',
    src: '',
    thumbnail: '',
    alt: 'Featured past event 3',
    year: 2024,
    eventTitle: 'Past Event 3 — replace with client asset',
  },
  {
    id: 'featured-4',
    type: 'photo',
    src: '',
    alt: 'Featured past event 4',
    year: 2024,
    eventTitle: 'Past Event 4 — replace with client asset',
  },
]

export const pastMediaGallery: MediaItem[] = [
  ...featuredPastWork,
  {
    id: 'gallery-5',
    type: 'photo',
    src: '',
    alt: 'Gallery photo 5',
    year: 2025,
    eventTitle: 'Gallery Event 5 — replace with client asset',
  },
  {
    id: 'gallery-6',
    type: 'video',
    src: '',
    thumbnail: '',
    alt: 'Gallery video 6',
    year: 2024,
    eventTitle: 'Gallery Event 6 — replace with client asset',
  },
  {
    id: 'gallery-7',
    type: 'photo',
    src: '',
    alt: 'Gallery photo 7',
    year: 2024,
    eventTitle: 'Gallery Event 7 — replace with client asset',
  },
  {
    id: 'gallery-8',
    type: 'photo',
    src: '',
    alt: 'Gallery photo 8',
    year: 2023,
    eventTitle: 'Gallery Event 8 — replace with client asset',
  },
]
```

- [ ] **Step 2: Write `src/lib/eventsConfig.ts`**

```ts
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
    description: 'New Year\'s Eve live music spectacular. Placeholder — replace with real event details.',
    lineup: ['Headliner TBC'],
    status: 'upcoming',
    ticketPhases: [
      { id: 'ph-8', name: 'Early Bird', price: 5000, currency: 'LKR', isActive: true, isSoldOut: false },
      { id: 'ph-9', name: 'Standard',   price: 7500, currency: 'LKR', isActive: false, isSoldOut: false },
    ],
  },
]
```

- [ ] **Step 3: Write `src/lib/teamConfig.ts`**

```ts
import type { TeamMember } from '@/lib/types'

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Team Member Name',
    role: 'Founder & Creative Director',
    bio: 'Placeholder bio — replace with real content.',
  },
  {
    id: 'tm-2',
    name: 'Team Member Name',
    role: 'Head of Production',
    bio: 'Placeholder bio — replace with real content.',
  },
  {
    id: 'tm-3',
    name: 'Team Member Name',
    role: 'Artist Relations',
    bio: 'Placeholder bio — replace with real content.',
  },
  {
    id: 'tm-4',
    name: 'Team Member Name',
    role: 'Marketing & Partnerships',
    bio: 'Placeholder bio — replace with real content.',
  },
]
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/mediaConfig.ts src/lib/eventsConfig.ts src/lib/teamConfig.ts
git commit -m "feat: add swappable placeholder config for media, events, and team"
```

---

## Task 7: Primitive UI Components

**Files:**
- Create: `src/components/ui/GhostButton.tsx`
- Create: `src/components/ui/PlaceholderMedia.tsx`

- [ ] **Step 1: Write `src/components/ui/GhostButton.tsx`**

```tsx
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

type Variant = 'thin' | 'pill'

interface BaseProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never }
type LinkProps   = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>  & { href: string }

type Props = ButtonProps | LinkProps

function variantClasses(variant: Variant) {
  if (variant === 'thin') {
    return 'border border-ghost-white text-ghost-white px-6 py-0 rounded-none text-body font-light tracking-widest uppercase'
  }
  return 'border-[3px] border-ghost-white text-ghost-white px-7 pt-5 pb-0 rounded-pill text-body font-light tracking-widest uppercase'
}

export default function GhostButton({ variant = 'pill', className = '', children, ...props }: Props) {
  const classes = `inline-flex items-center justify-center transition-opacity hover:opacity-70 ${variantClasses(variant)} ${className}`

  if ('href' in props && props.href) {
    const { href, ...rest } = props as LinkProps
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Write `src/components/ui/PlaceholderMedia.tsx`**

```tsx
import { Film, Image as ImageIcon } from 'lucide-react'

interface Props {
  label: string
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/4' | '9/16'
  type?: 'video' | 'image'
  className?: string
}

const ratioClass: Record<NonNullable<Props['aspectRatio']>, string> = {
  '16/9': 'aspect-video',
  '4/3':  'aspect-[4/3]',
  '1/1':  'aspect-square',
  '3/4':  'aspect-[3/4]',
  '9/16': 'aspect-[9/16]',
}

export default function PlaceholderMedia({
  label,
  aspectRatio = '16/9',
  type = 'image',
  className = '',
}: Props) {
  return (
    <div
      className={`relative w-full ${ratioClass[aspectRatio]} border border-pewter flex flex-col items-center justify-center gap-3 bg-absolute-zero/50 ${className}`}
    >
      <div className="text-pewter">
        {type === 'video' ? <Film size={32} strokeWidth={1} /> : <ImageIcon size={32} strokeWidth={1} />}
      </div>
      <p className="text-caption text-pewter text-center max-w-[200px] leading-relaxed px-4">
        {label}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add GhostButton and PlaceholderMedia primitive components"
```

---

## Task 8: ScrollReveal + SplitHeadline

**Files:**
- Create: `src/components/ui/ScrollReveal.tsx`
- Create: `src/components/ui/SplitHeadline.tsx`

- [ ] **Step 1: Write `src/components/ui/ScrollReveal.tsx`**

Framer Motion viewport-triggered reveal wrapper. Body copy fades + translates; no word-splitting.

```tsx
'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number       // stagger offset in seconds
  once?: boolean
}

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

export default function ScrollReveal({ children, className = '', delay = 0, once = true }: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      custom={delay}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Write `src/components/ui/SplitHeadline.tsx`**

Manual word-split with Framer Motion stagger. GSAP SplitText is a paid plugin; we achieve the same effect with React + Framer.

```tsx
'use client'

import { motion, type Variants } from 'framer-motion'

interface Props {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  once?: boolean
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const word: Variants = {
  hidden:  { opacity: 0, y: '110%' },
  visible: { opacity: 1, y: '0%', transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
}

export default function SplitHeadline({ text, as: Tag = 'h2', className = '', once = true }: Props) {
  const words = text.split(' ')
  return (
    <Tag className={`overflow-hidden ${className}`} aria-label={text}>
      <motion.span
        className="flex flex-wrap gap-x-[0.3em]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.5 }}
        variants={container}
        aria-hidden
      >
        {words.map((w, i) => (
          <span key={i} className="overflow-hidden inline-block">
            <motion.span className="inline-block" variants={word}>
              {w}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ScrollReveal.tsx src/components/ui/SplitHeadline.tsx
git commit -m "feat: add ScrollReveal and SplitHeadline animation components"
```

---

## Task 9: Lenis Smooth Scroll Provider

**Files:**
- Create: `src/components/layout/SmoothScrollProvider.tsx`

- [ ] **Step 1: Write `src/components/layout/SmoothScrollProvider.tsx`**

```tsx
'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'

interface Props { children: ReactNode }

export default function SmoothScrollProvider({ children }: Props) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    let rafId: number

    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/SmoothScrollProvider.tsx
git commit -m "feat: add Lenis smooth scroll provider"
```

---

## Task 10: Custom Cursor

**Files:**
- Create: `src/components/layout/CustomCursor.tsx`

- [ ] **Step 1: Write `src/components/layout/CustomCursor.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true)
      return
    }

    let x = 0, y = 0
    let ringX = 0, ringY = 0
    let rafId: number

    function onMove(e: MouseEvent) {
      x = e.clientX
      y = e.clientY
    }

    function onEnter() { setHovered(true)  }
    function onLeave() { setHovered(false) }

    document.addEventListener('mousemove', onMove)

    const interactables = () =>
      document.querySelectorAll<HTMLElement>('a, button, [data-cursor-hover]')

    function attachListeners() {
      interactables().forEach((el) => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    attachListeners()

    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

    function tick() {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`
      }
      ringX = lerp(ringX, x, 0.12)
      ringY = lerp(ringY, y, 0.12)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      {/* small filled dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full pointer-events-none"
        style={{
          backgroundColor: hovered ? 'var(--color-electric-lime)' : 'var(--color-ghost-white)',
          transition: 'background-color 0.2s',
        }}
      />
      {/* trailing ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] w-8 h-8 rounded-full border pointer-events-none"
        style={{
          borderColor: hovered ? 'var(--color-electric-lime)' : 'var(--color-ghost-white)',
          transform: `scale(${hovered ? 2 : 1})`,
          transition: 'border-color 0.2s, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/CustomCursor.tsx
git commit -m "feat: add custom dot+ring cursor with hover scale"
```

---

## Task 11: Ambient Clock

**Files:**
- Create: `src/components/layout/AmbientClock.tsx`

- [ ] **Step 1: Write `src/components/layout/AmbientClock.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function AmbientClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      setTime(`COLOMBO_${hh}:${mm}:${ss}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  return (
    <span
      className="text-caption font-light tracking-widest tabular-nums"
      style={{ color: 'var(--color-pewter)', opacity: 0.6 }}
      aria-hidden
    >
      {time}
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/AmbientClock.tsx
git commit -m "feat: add ambient live clock label"
```

---

## Task 12: Navbar

**Files:**
- Create: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Write `src/components/layout/Navbar.tsx`**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import GhostButton from '@/components/ui/GhostButton'
import AmbientClock from '@/components/layout/AmbientClock'

const navLinks = [
  { label: 'Home',            href: '/' },
  { label: 'Upcoming Events', href: '/events/upcoming' },
  { label: 'Past Events',     href: '/events/past' },
  { label: 'About Us',        href: '/about' },
]

const overlay: Variants = {
  closed: { opacity: 0 },
  open:   { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const linkContainer: Variants = {
  closed: {},
  open:   { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
}

const linkItem: Variants = {
  closed: { opacity: 0, x: 40 },
  open:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" onClick={() => setOpen(false)} aria-label="SNT home">
          <Image
            src="/logo-white.png"
            alt="SNT Events logo"
            width={80}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          <AmbientClock />
          <GhostButton
            variant="thin"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            Menu
          </GhostButton>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] bg-absolute-zero flex flex-col"
            variants={overlay}
            initial="closed"
            animate="open"
            exit="closed"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* top bar mirrors the header */}
            <div className="flex items-center justify-between px-6 py-4 md:px-10">
              <Link href="/" onClick={() => setOpen(false)} aria-label="SNT home">
                <Image
                  src="/logo-white.png"
                  alt="SNT Events logo"
                  width={80}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <GhostButton
                variant="thin"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                Fermer le menu
              </GhostButton>
            </div>

            {/* nav links */}
            <nav className="flex-1 flex flex-col justify-center px-6 md:px-10">
              <motion.ul
                className="list-none flex flex-col gap-2"
                variants={linkContainer}
                initial="closed"
                animate="open"
              >
                {navLinks.map(({ label, href }) => (
                  <motion.li key={href} variants={linkItem}>
                    <Link
                      href={href}
                      className="block text-ghost-white font-light leading-tight hover:text-electric-lime transition-colors"
                      style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>

            {/* footer row */}
            <div className="px-6 pb-6 md:px-10">
              <p className="text-caption text-pewter">
                © {new Date().getFullYear()} SNT Live Events. All rights reserved.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: add full-screen menu overlay Navbar with stagger animation"
```

---

## Task 13: Footer

**Files:**
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Write `src/components/layout/Footer.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-pewter/30 px-6 py-10 md:px-10 md:py-14">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Image
            src="/logo-white.png"
            alt="SNT Events"
            width={80}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <p className="text-body-sm text-pewter max-w-xs">
            Sri Lanka's premier live music event company. We bring the best bands to iconic stages.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-col gap-3">
            {[
              { label: 'Home',            href: '/' },
              { label: 'Upcoming Events', href: '/events/upcoming' },
              { label: 'Past Events',     href: '/events/past' },
              { label: 'About Us',        href: '/about' },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-body-sm text-pewter hover:text-ghost-white transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2">
          <p className="text-body-sm text-pewter">Get in touch</p>
          <a
            href="mailto:hello@sntevents.lk"
            className="text-body-sm text-ghost-white hover:text-electric-lime transition-colors"
          >
            hello@sntevents.lk
          </a>
          <p className="text-caption text-pewter mt-4">
            Colombo, Sri Lanka
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-pewter/20">
        <p className="text-caption text-pewter/50">
          © {new Date().getFullYear()} SNT Live Events. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: add Footer with nav links and contact"
```

---

## Task 14: Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Rewrite `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider'
import CustomCursor from '@/components/layout/CustomCursor'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'SNT Live Events — Sri Lanka\'s Premier Live Music Company',
    template: '%s | SNT Live Events',
  },
  description:
    'SNT organizes world-class live music events with top-tier bands across Sri Lanka.',
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    siteName: 'SNT Live Events',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-absolute-zero text-ghost-white font-lausanne">
        <SmoothScrollProvider>
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Delete the create-next-app default `page.tsx` content and replace temporarily**

Open `src/app/page.tsx` and replace everything with:

```tsx
export default function Home() {
  return <div className="min-h-screen pt-20 px-6 text-ghost-white">Home — coming soon</div>
}
```

- [ ] **Step 3: Verify dev server**

```bash
npm run dev
```

Navigate to http://localhost:3000 — expect: black background, white "Home — coming soon" text, Navbar visible with logo and "Menu" button, no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: wire root layout with providers, Navbar, Footer"
```

---

## Task 15: Hero Carousel

**Files:**
- Create: `src/components/media/HeroCarousel.tsx`

- [ ] **Step 1: Write `src/components/media/HeroCarousel.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { HeroSlide } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import SplitHeadline from '@/components/ui/SplitHeadline'

interface Props {
  slides: HeroSlide[]
  heading: string
  tagline: string
}

const AUTOPLAY_MS = 4500

export default function HeroCarousel({ slides, heading, tagline }: Props) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function advance() {
    setIndex((i) => (i + 1) % slides.length)
  }

  useEffect(() => {
    timerRef.current = setInterval(advance, AUTOPLAY_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slides.length])

  function goTo(i: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setIndex(i)
    timerRef.current = setInterval(advance, AUTOPLAY_MS)
  }

  const slide = slides[index]

  return (
    <section className="relative w-full h-screen overflow-hidden" aria-label="Hero carousel">
      {/* slide background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          {slide.src ? (
            slide.type === 'video' ? (
              <video
                src={slide.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                aria-label={slide.alt}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full">
              <PlaceholderMedia
                label={slide.label}
                aspectRatio="16/9"
                type={slide.type}
                className="w-full h-full aspect-auto"
              />
            </div>
          )}
          {/* dark overlay */}
          <div className="absolute inset-0 bg-absolute-zero/50" />
        </motion.div>
      </AnimatePresence>

      {/* text overlay */}
      <div
        className="relative z-10 flex flex-col justify-end h-full pb-16 md:pb-24"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <SplitHeadline
          text={heading}
          as="h1"
          className="text-ghost-white font-light leading-none mb-4"
          style={{ fontSize: 'var(--text-display-sm)' } as React.CSSProperties}
          once={false}
        />
        <motion.p
          className="text-body-lg text-ghost-white/80 font-light max-w-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {tagline}
        </motion.p>

        {/* slide indicators */}
        <div className="flex gap-2 mt-8" role="tablist" aria-label="Carousel slides">
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="h-px w-8 transition-all duration-300"
              style={{ backgroundColor: i === index ? 'var(--color-ghost-white)' : 'var(--color-pewter)' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/media/HeroCarousel.tsx
git commit -m "feat: add autoplay HeroCarousel with crossfade and split headline"
```

---

## Task 16: Home Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Rewrite `src/app/page.tsx`**

```tsx
import Link from 'next/link'
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
          style={{ fontSize: 'var(--text-heading-sm)' } as React.CSSProperties}
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
            style={{ fontSize: 'var(--text-heading-sm)' } as React.CSSProperties}
          />
          <ScrollReveal delay={0.1}>
            <GhostButton href="/events/past" variant="thin">
              View All
            </GhostButton>
          </ScrollReveal>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            style={{ fontSize: 'var(--text-heading-sm)' } as React.CSSProperties}
          />
          <ScrollReveal delay={0.1}>
            <GhostButton href="/events/upcoming" variant="thin">
              All Events
            </GhostButton>
          </ScrollReveal>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
```

- [ ] **Step 2: Commit** (MediaCard and FlyerCard don't exist yet — this will be wired up in Tasks 17 + 20. Verify `tsc --noEmit` once those tasks are done.)

```bash
git add src/app/page.tsx
git commit -m "feat: build Home page with hero, about teaser, and event strips"
```

---

## Task 17: MediaCard + Lightbox

**Files:**
- Create: `src/components/media/MediaCard.tsx`
- Create: `src/components/events/Lightbox.tsx`

- [ ] **Step 1: Write `src/components/media/MediaCard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import Lightbox from '@/components/events/Lightbox'

interface Props { item: MediaItem }

export default function MediaCard({ item }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="group relative w-full border border-pewter/30 hover:border-ghost-white transition-colors overflow-hidden text-left"
        onClick={() => setOpen(true)}
        aria-label={`View ${item.eventTitle}`}
      >
        <div className="aspect-video relative">
          {item.thumbnail || item.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnail ?? item.src}
              alt={item.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PlaceholderMedia label={item.eventTitle} type={item.type} aspectRatio="16/9" />
          )}
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-ghost-white flex items-center justify-center bg-absolute-zero/60 group-hover:bg-electric-lime/20 transition-colors">
                <Play size={20} className="text-ghost-white ml-1" fill="white" />
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-pewter/30">
          <p className="text-body-sm text-ghost-white truncate">{item.eventTitle}</p>
          <p className="text-caption text-pewter">{item.year}</p>
        </div>
      </button>

      <Lightbox
        open={open}
        onClose={() => setOpen(false)}
        item={item}
      />
    </>
  )
}
```

- [ ] **Step 2: Write `src/components/events/Lightbox.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'

interface Props {
  open: boolean
  onClose: () => void
  item: MediaItem | null
}

export default function Lightbox({ open, onClose, item }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[200] bg-absolute-zero/95 flex items-center justify-center p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={item.eventTitle}
          onClick={onClose}
        >
          <button
            className="absolute top-6 right-6 text-ghost-white hover:text-electric-lime transition-colors"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          <motion.div
            className="w-full max-w-5xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {item.src ? (
              item.type === 'video' ? (
                <video
                  src={item.src}
                  controls
                  autoPlay
                  className="w-full aspect-video rounded-none"
                  aria-label={item.alt}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt={item.alt} className="w-full max-h-[80vh] object-contain" />
              )
            ) : (
              <PlaceholderMedia label={item.eventTitle} type={item.type} aspectRatio="16/9" />
            )}
            <div className="mt-4">
              <p className="text-body-sm text-ghost-white">{item.eventTitle}</p>
              <p className="text-caption text-pewter">{item.year}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/media/MediaCard.tsx src/components/events/Lightbox.tsx
git commit -m "feat: add MediaCard with Lightbox for past event gallery"
```

---

## Task 18: EventFilter + EventsGallery (Client)

**Files:**
- Create: `src/components/events/EventFilter.tsx`
- Create: `src/components/events/EventsGallery.tsx`

- [ ] **Step 1: Write failing test for EventFilter**

Create `src/__tests__/components/EventFilter.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import EventFilter from '@/components/events/EventFilter'

const years = [2023, 2024, 2025]

it('renders All, video, photo, and year buttons', () => {
  render(<EventFilter years={years} activeYear={null} activeType={null} onYear={() => {}} onType={() => {}} />)
  expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Videos' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Photos' })).toBeInTheDocument()
  years.forEach((y) => expect(screen.getByRole('button', { name: String(y) })).toBeInTheDocument())
})

it('calls onYear when a year button is clicked', () => {
  const onYear = jest.fn()
  render(<EventFilter years={years} activeYear={null} activeType={null} onYear={onYear} onType={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: '2024' }))
  expect(onYear).toHaveBeenCalledWith(2024)
})

it('calls onType when Videos is clicked', () => {
  const onType = jest.fn()
  render(<EventFilter years={years} activeYear={null} activeType={null} onYear={() => {}} onType={onType} />)
  fireEvent.click(screen.getByRole('button', { name: 'Videos' }))
  expect(onType).toHaveBeenCalledWith('video')
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- src/__tests__/components/EventFilter.test.tsx
```

Expected: FAIL — `EventFilter` not found.

- [ ] **Step 3: Write `src/components/events/EventFilter.tsx`**

```tsx
'use client'

type MediaType = 'video' | 'photo'

interface Props {
  years: number[]
  activeYear: number | null
  activeType: MediaType | null
  onYear: (year: number | null) => void
  onType: (type: MediaType | null) => void
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="text-caption tracking-widest uppercase px-4 py-2 border transition-colors"
      style={{
        borderColor: active ? 'var(--color-ghost-white)' : 'var(--color-pewter)',
        color: active ? 'var(--color-ghost-white)' : 'var(--color-pewter)',
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </button>
  )
}

export default function EventFilter({ years, activeYear, activeType, onYear, onType }: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Filter gallery">
      <FilterBtn active={!activeType && !activeYear} onClick={() => { onType(null); onYear(null) }}>
        All
      </FilterBtn>
      <FilterBtn active={activeType === 'video'} onClick={() => onType(activeType === 'video' ? null : 'video')}>
        Videos
      </FilterBtn>
      <FilterBtn active={activeType === 'photo'} onClick={() => onType(activeType === 'photo' ? null : 'photo')}>
        Photos
      </FilterBtn>
      <span className="w-px h-5 bg-pewter/30 mx-1" aria-hidden />
      {years.map((y) => (
        <FilterBtn key={y} active={activeYear === y} onClick={() => onYear(activeYear === y ? null : y)}>
          {y}
        </FilterBtn>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- src/__tests__/components/EventFilter.test.tsx
```

Expected: 3 tests PASS.

- [ ] **Step 5: Write `src/components/events/EventsGallery.tsx`**

```tsx
'use client'

import { useState, useMemo } from 'react'
import type { MediaItem } from '@/lib/types'
import EventFilter from '@/components/events/EventFilter'
import MediaCard from '@/components/media/MediaCard'

interface Props { items: MediaItem[] }

export default function EventsGallery({ items }: Props) {
  const [activeYear, setActiveYear] = useState<number | null>(null)
  const [activeType, setActiveType] = useState<'video' | 'photo' | null>(null)

  const years = useMemo(
    () => [...new Set(items.map((i) => i.year))].sort((a, b) => b - a),
    [items]
  )

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (!activeYear || i.year === activeYear) &&
          (!activeType || i.type === activeType)
      ),
    [items, activeYear, activeType]
  )

  return (
    <div>
      <div className="mb-8">
        <EventFilter
          years={years}
          activeYear={activeYear}
          activeType={activeType}
          onYear={setActiveYear}
          onType={setActiveType}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-body text-pewter py-16 text-center">No items match the selected filters.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="break-inside-avoid">
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/events/EventFilter.tsx src/components/events/EventsGallery.tsx \
        src/__tests__/components/EventFilter.test.tsx
git commit -m "feat: add EventFilter and EventsGallery with masonry layout and tests"
```

---

## Task 19: Past Events Page

**Files:**
- Create: `src/app/events/past/page.tsx`

- [ ] **Step 1: Write `src/app/events/past/page.tsx`**

```tsx
import type { Metadata } from 'next'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import EventsGallery from '@/components/events/EventsGallery'
import { pastMediaGallery } from '@/lib/mediaConfig'
import { getPastEvents } from '@/lib/api'
import type { MediaItem } from '@/lib/types'

export const metadata: Metadata = { title: 'Past Events' }

async function fetchPastMedia(): Promise<MediaItem[]> {
  try {
    const events = await getPastEvents()
    const items: MediaItem[] = events.flatMap((ev) =>
      (ev.media ?? []).map((m, idx) => ({
        id: `${ev.id}-media-${idx}`,
        type: m.type,
        src: m.url,
        alt: m.alt,
        year: new Date(ev.date).getFullYear(),
        eventTitle: ev.title,
      }))
    )
    return items.length > 0 ? items : pastMediaGallery
  } catch {
    return pastMediaGallery
  }
}

export default async function PastEventsPage() {
  const items = await fetchPastMedia()

  return (
    <div className="pt-32 pb-24">
      <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Portfolio</p>
        </ScrollReveal>
        <SplitHeadline
          text="Past Events"
          as="h1"
          className="text-ghost-white font-light mb-16"
          style={{ fontSize: 'var(--text-heading-sm)' } as React.CSSProperties}
        />
        <EventsGallery items={items} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/events/past/
git commit -m "feat: build Past Events gallery page with API + placeholder fallback"
```

---

## Task 20: FlyerCard

**Files:**
- Create: `src/components/events/FlyerCard.tsx`

- [ ] **Step 1: Write `src/components/events/FlyerCard.tsx`**

```tsx
import Link from 'next/link'
import type { Event } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'

interface Props { event: Event }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-LK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function FlyerCard({ event }: Props) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block border border-pewter/30 hover:border-ghost-white transition-colors overflow-hidden"
      aria-label={`${event.title} — ${formatDate(event.date)}`}
    >
      {/* flyer image: neutral container enforces consistent frame regardless of flyer color */}
      <div className="aspect-[3/4] relative bg-absolute-zero overflow-hidden">
        {event.flyerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.flyerUrl}
            alt={`${event.title} event flyer`}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderMedia
            label={`${event.title} — flyer image (replace with client asset)`}
            aspectRatio="3/4"
            type="image"
            className="w-full h-full"
          />
        )}
      </div>

      {/* event info: always neutral, never clashes with flyer color */}
      <div className="p-4 border-t border-pewter/30 flex flex-col gap-1">
        <p className="text-caption text-electric-lime tracking-widest uppercase">
          {formatDate(event.date)}
        </p>
        <h3 className="text-body-lg text-ghost-white font-light group-hover:text-electric-lime transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-body-sm text-pewter truncate">{event.venue}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/events/FlyerCard.tsx
git commit -m "feat: add FlyerCard with neutral frame to contain loud flyer colors"
```

---

## Task 21: Upcoming Events Page

**Files:**
- Create: `src/app/events/upcoming/page.tsx`

- [ ] **Step 1: Write `src/app/events/upcoming/page.tsx`**

```tsx
import type { Metadata } from 'next'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import FlyerCard from '@/components/events/FlyerCard'
import { upcomingEventsPlaceholder } from '@/lib/eventsConfig'
import { getUpcomingEvents } from '@/lib/api'
import type { Event } from '@/lib/types'

export const metadata: Metadata = { title: 'Upcoming Events' }

async function fetchUpcoming(): Promise<Event[]> {
  try {
    const events = await getUpcomingEvents()
    return events.length > 0 ? events : upcomingEventsPlaceholder
  } catch {
    return upcomingEventsPlaceholder
  }
}

export default async function UpcomingEventsPage() {
  const events = await fetchUpcoming()

  return (
    <div className="pt-32 pb-24" style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>
      <ScrollReveal>
        <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">What&apos;s on</p>
      </ScrollReveal>
      <SplitHeadline
        text="Upcoming Events"
        as="h1"
        className="text-ghost-white font-light mb-16"
        style={{ fontSize: 'var(--text-heading-sm)' } as React.CSSProperties}
      />

      {events.length === 0 ? (
        <p className="text-body text-pewter">No upcoming events at this time. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event, i) => (
            <ScrollReveal key={event.id} delay={i * 0.06}>
              <FlyerCard event={event} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/events/upcoming/
git commit -m "feat: build Upcoming Events page with flyer grid"
```

---

## Task 22: TicketPhaseCard

**Files:**
- Create: `src/components/events/TicketPhaseCard.tsx`

- [ ] **Step 1: Write `src/components/events/TicketPhaseCard.tsx`**

```tsx
'use client'

import type { TicketPhase } from '@/lib/types'

interface Props {
  phase: TicketPhase
  selected: boolean
  onSelect: (phase: TicketPhase) => void
}

export default function TicketPhaseCard({ phase, selected, onSelect }: Props) {
  const unavailable = !phase.isActive || phase.isSoldOut

  return (
    <button
      onClick={() => !unavailable && onSelect(phase)}
      disabled={unavailable}
      aria-pressed={selected}
      aria-label={`${phase.name} — ${phase.currency} ${phase.price.toLocaleString()}${phase.isSoldOut ? ' — Sold out' : !phase.isActive ? ' — Not available yet' : ''}`}
      className="w-full text-left border transition-colors p-5 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: selected
          ? 'var(--color-ghost-white)'
          : unavailable
          ? 'var(--color-pewter)'
          : 'var(--color-pewter)',
        backgroundColor: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-body-lg text-ghost-white font-light">{phase.name}</p>
          {phase.isSoldOut && (
            <p className="text-caption text-electric-lime tracking-widest uppercase mt-1">Sold out</p>
          )}
          {!phase.isSoldOut && !phase.isActive && (
            <p className="text-caption text-pewter tracking-widest uppercase mt-1">Coming soon</p>
          )}
        </div>
        <p className="text-body-lg text-ghost-white font-light whitespace-nowrap">
          {phase.currency} {phase.price.toLocaleString()}
        </p>
      </div>

      {selected && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-electric-lime)' }}
          />
          <span className="text-caption text-electric-lime tracking-widest uppercase">Selected</span>
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/events/TicketPhaseCard.tsx
git commit -m "feat: add TicketPhaseCard with selected, sold-out, and inactive states"
```

---

## Task 23: EmailCaptureModal + Tests

**Files:**
- Create: `src/components/events/EmailCaptureModal.tsx`
- Create: `src/__tests__/components/EmailCaptureModal.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/components/EmailCaptureModal.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmailCaptureModal from '@/components/events/EmailCaptureModal'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
const mockCreate = api.createTicketRequest as jest.MockedFunction<typeof api.createTicketRequest>

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  eventId: 'evt-1',
  phaseName: 'Early Bird',
  phaseId: 'ph-1',
}

it('renders the modal when open', () => {
  mockCreate.mockResolvedValue({ message: 'ok' })
  render(<EmailCaptureModal {...defaultProps} />)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('Early Bird')).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
})

it('shows validation error on empty submit', async () => {
  mockCreate.mockResolvedValue({ message: 'ok' })
  render(<EmailCaptureModal {...defaultProps} />)
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument()
  expect(mockCreate).not.toHaveBeenCalled()
})

it('calls createTicketRequest and shows confirmation', async () => {
  mockCreate.mockResolvedValue({ message: 'ok' })
  render(<EmailCaptureModal {...defaultProps} />)
  await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'fan@test.com')
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  await waitFor(() =>
    expect(mockCreate).toHaveBeenCalledWith({ eventId: 'evt-1', phaseId: 'ph-1', email: 'fan@test.com' })
  )
  expect(await screen.findByText(/we've received your request for early bird/i)).toBeInTheDocument()
})

it('shows error message on API failure', async () => {
  mockCreate.mockRejectedValue(new Error('Server error'))
  render(<EmailCaptureModal {...defaultProps} />)
  await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'fan@test.com')
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- src/__tests__/components/EmailCaptureModal.test.tsx
```

Expected: FAIL — `EmailCaptureModal` not found.

- [ ] **Step 3: Write `src/components/events/EmailCaptureModal.tsx`**

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createTicketRequest } from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
  eventId: string
  phaseName: string
  phaseId: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function EmailCaptureModal({ open, onClose, eventId, phaseName, phaseId }: Props) {
  const [email, setEmail]           = useState('')
  const [status, setStatus]         = useState<Status>('idle')
  const [errorMsg, setErrorMsg]     = useState('')
  const [fieldError, setFieldError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setStatus('idle')
    setErrorMsg('')
    setFieldError('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Please enter a valid email address.')
      return
    }
    setFieldError('')
    setStatus('loading')
    try {
      await createTicketRequest({ eventId, phaseId, email: trimmed })
      setStatus('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setErrorMsg(msg.includes('sold') ? 'This phase is sold out.' : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-absolute-zero/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md border border-pewter/50 bg-absolute-zero p-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-caption text-electric-lime tracking-widest uppercase mb-1">
                  Ticket Request
                </p>
                <h2 id="modal-title" className="text-heading-sm text-ghost-white font-light">
                  {phaseName}
                </h2>
              </div>
              <button onClick={onClose} aria-label="Close modal" className="text-pewter hover:text-ghost-white transition-colors mt-1">
                <X size={20} />
              </button>
            </div>

            {status === 'success' ? (
              <div className="py-4">
                <p className="text-body text-ghost-white leading-relaxed">
                  Thanks! We&apos;ve received your request for{' '}
                  <strong className="font-light text-electric-lime">{phaseName}</strong>.
                  Our team will email you shortly with payment details.
                </p>
                <button
                  onClick={onClose}
                  className="mt-8 text-caption text-pewter hover:text-ghost-white tracking-widest uppercase transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-6">
                  <label htmlFor="ticket-email" className="block text-body-sm text-pewter mb-2">
                    Email address
                  </label>
                  <input
                    ref={inputRef}
                    id="ticket-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldError('') }}
                    placeholder="your@email.com"
                    className="w-full bg-transparent border border-pewter/50 focus:border-ghost-white px-4 py-3 text-body text-ghost-white placeholder:text-pewter/50 outline-none transition-colors"
                    aria-describedby={fieldError ? 'field-error' : undefined}
                    aria-invalid={!!fieldError}
                  />
                  {fieldError && (
                    <p id="field-error" className="text-caption text-red-400 mt-2">
                      {fieldError}
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <p className="text-caption text-red-400 mb-4">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full border border-ghost-white text-ghost-white text-body-sm tracking-widest uppercase py-3 px-6 hover:bg-ghost-white hover:text-absolute-zero transition-colors disabled:opacity-50"
                  aria-label="Submit ticket request"
                >
                  {status === 'loading' ? 'Sending…' : 'Submit Request'}
                </button>

                <p className="text-caption text-pewter/60 mt-4 leading-relaxed">
                  We&apos;ll email you payment details. No card required now.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/__tests__/components/EmailCaptureModal.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/events/EmailCaptureModal.tsx src/__tests__/components/EmailCaptureModal.test.tsx
git commit -m "feat: add EmailCaptureModal with validation, loading, success, and error states + tests"
```

---

## Task 24: Event Detail Page

**Files:**
- Create: `src/app/events/[slug]/page.tsx`
- Create: `src/app/events/[slug]/loading.tsx`

- [ ] **Step 1: Write `src/app/events/[slug]/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="min-h-screen pt-32 flex items-center justify-center">
      <div className="text-caption text-pewter tracking-widest uppercase animate-pulse">
        Loading event…
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/app/events/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import TicketPhaseCard from '@/components/events/TicketPhaseCard'
import EmailCaptureModal from '@/components/events/EmailCaptureModal'
import { getEvent } from '@/lib/api'
import { upcomingEventsPlaceholder } from '@/lib/eventsConfig'
import type { Event, TicketPhase } from '@/lib/types'

interface PageProps { params: Promise<{ slug: string }> }

async function fetchEvent(slug: string): Promise<Event | null> {
  try {
    return await getEvent(slug)
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
      return null
    }
    // fall back to placeholder
    return upcomingEventsPlaceholder.find((e) => e.slug === slug) ?? null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchEvent(slug)
  if (!event) return { title: 'Event Not Found' }
  return {
    title: event.title,
    description: event.description,
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-LK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

// Isolated client island for ticket interaction
import EventTicketSection from './EventTicketSection'

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await fetchEvent(slug)
  if (!event) notFound()

  return (
    <article className="pt-32 pb-24">
      <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>

        {/* ── Flyer + Hero info ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="aspect-[3/4] relative border border-pewter/30">
            {event.flyerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.flyerUrl}
                alt={`${event.title} flyer`}
                className="w-full h-full object-contain"
              />
            ) : (
              <PlaceholderMedia
                label={`${event.title} — flyer image (replace with client asset)`}
                aspectRatio="3/4"
                type="image"
                className="w-full h-full"
              />
            )}
          </div>

          <div className="flex flex-col justify-end gap-6">
            <ScrollReveal>
              <p className="text-caption text-electric-lime tracking-widest uppercase">
                {event.status === 'upcoming' ? 'Upcoming Event' : 'Past Event'}
              </p>
            </ScrollReveal>
            <SplitHeadline
              text={event.title}
              as="h1"
              className="text-ghost-white font-light"
              style={{ fontSize: 'var(--text-heading-sm)' } as React.CSSProperties}
            />
            <ScrollReveal delay={0.1}>
              <div className="flex flex-col gap-2">
                <p className="text-body text-pewter">
                  <span className="text-ghost-white">Date: </span>
                  {formatDate(event.date)}
                </p>
                <p className="text-body text-pewter">
                  <span className="text-ghost-white">Venue: </span>
                  {event.venue}
                </p>
              </div>
            </ScrollReveal>
            {event.lineup.length > 0 && (
              <ScrollReveal delay={0.15}>
                <div>
                  <p className="text-body-sm text-pewter mb-2 tracking-widest uppercase">Lineup</p>
                  <ul className="flex flex-col gap-1">
                    {event.lineup.map((artist) => (
                      <li key={artist} className="text-body-lg text-ghost-white font-light">
                        {artist}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>

        {/* ── Description ──────────────────────────────── */}
        <ScrollReveal>
          <div className="max-w-2xl mb-20 border-t border-pewter/20 pt-10">
            <p className="text-caption text-electric-lime tracking-widest uppercase mb-4">About this event</p>
            <p className="text-body text-pewter leading-relaxed">{event.description}</p>
          </div>
        </ScrollReveal>

        {/* ── Ticket Phases (client island) ─────────────── */}
        {event.status === 'upcoming' && event.ticketPhases && event.ticketPhases.length > 0 && (
          <EventTicketSection
            eventId={event.id}
            phases={event.ticketPhases}
          />
        )}
      </div>
    </article>
  )
}
```

- [ ] **Step 3: Create `src/app/events/[slug]/EventTicketSection.tsx`** (client island)

```tsx
'use client'

import { useState } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import TicketPhaseCard from '@/components/events/TicketPhaseCard'
import EmailCaptureModal from '@/components/events/EmailCaptureModal'
import type { TicketPhase } from '@/lib/types'

interface Props {
  eventId: string
  phases: TicketPhase[]
}

export default function EventTicketSection({ eventId, phases }: Props) {
  const [selectedPhase, setSelectedPhase] = useState<TicketPhase | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function handleSelect(phase: TicketPhase) {
    setSelectedPhase(phase)
    setModalOpen(true)
  }

  return (
    <>
      <ScrollReveal>
        <div className="border-t border-pewter/20 pt-10">
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Tickets</p>
          <p className="text-body-sm text-pewter mb-8 max-w-md">
            Select a ticket phase to request your spot. Our team will contact you with payment
            details by email.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl">
            {phases.map((phase) => (
              <TicketPhaseCard
                key={phase.id}
                phase={phase}
                selected={selectedPhase?.id === phase.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </ScrollReveal>

      {selectedPhase && (
        <EmailCaptureModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          eventId={eventId}
          phaseId={selectedPhase.id}
          phaseName={selectedPhase.name}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Fix the import in `page.tsx`** — move `EventTicketSection` import to top of file (Next.js server components cannot use inline `import` inside function bodies). Open `src/app/events/[slug]/page.tsx` and move the import statement:

Remove the line inside the file body:
```
import EventTicketSection from './EventTicketSection'
```
And add it at the top with the other imports.

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/events/\[slug\]/
git commit -m "feat: build Event Detail page with ticket phases and email capture"
```

---

## Task 25: TeamMemberCard

**Files:**
- Create: `src/components/events/TeamMemberCard.tsx`

- [ ] **Step 1: Write `src/components/events/TeamMemberCard.tsx`**

```tsx
import type { TeamMember } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'

interface Props { member: TeamMember }

export default function TeamMemberCard({ member }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square border border-pewter/30 overflow-hidden">
        {member.photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoSrc}
            alt={`${member.name} — ${member.role}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <PlaceholderMedia
            label={`${member.name} — portrait photo (replace with client asset)`}
            aspectRatio="1/1"
            type="image"
          />
        )}
      </div>
      <div>
        <p className="text-body text-ghost-white font-light">{member.name}</p>
        <p className="text-body-sm text-electric-lime">{member.role}</p>
        <p className="text-body-sm text-pewter mt-2 leading-relaxed">{member.bio}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/events/TeamMemberCard.tsx
git commit -m "feat: add TeamMemberCard with photo placeholder"
```

---

## Task 26: About Page

**Files:**
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Write `src/app/about/page.tsx`**

```tsx
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

        {/* ── Story ──────────────────────────────────────── */}
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Our story</p>
        </ScrollReveal>
        <SplitHeadline
          text="Born from a love of live music."
          as="h1"
          className="text-ghost-white font-light mb-12 max-w-4xl"
          style={{ fontSize: 'var(--text-heading-sm)' } as React.CSSProperties}
        />

        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24 max-w-4xl">
            <p className="text-body text-pewter leading-relaxed">
              {/* Replace with real company story */}
              SNT was founded with a single belief: that Sri Lanka deserves world-class live
              music experiences. From intimate club nights to stadium spectacles, we&apos;ve
              spent years building relationships with the finest bands and most iconic venues
              across the island.
            </p>
            <p className="text-body text-pewter leading-relaxed">
              {/* Replace with real company story */}
              Our team handles everything — from artist booking and stage production to
              ticketing logistics and crowd experience — so the night you attend is flawless
              from the first note to the last.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Team ──────────────────────────────────────── */}
        <div className="border-t border-pewter/20 pt-16 mb-16">
          <ScrollReveal>
            <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">The team</p>
          </ScrollReveal>
          <SplitHeadline
            text="The people behind the sound."
            as="h2"
            className="text-ghost-white font-light mb-12"
            style={{ fontSize: 'var(--text-heading-sm)' } as React.CSSProperties}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <ScrollReveal key={member.id} delay={i * 0.08}>
                <TeamMemberCard member={member} />
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────── */}
        <ScrollReveal>
          <div className="border-t border-pewter/20 pt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6">
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: build About page with company story and team grid"
```

---

## Task 27: Final Verification

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 3: Build for production**

```bash
npm run build
```

Expected: build succeeds with no errors. Warnings about `img` vs `next/image` are acceptable (real images will be Cloudinary URLs or local assets added later).

- [ ] **Step 4: Smoke-test dev server on all routes**

```bash
npm run dev
```

Manually visit:
- `http://localhost:3000` — hero carousel (placeholder), about teaser, featured work strip, upcoming strip
- `http://localhost:3000/events/past` — masonry gallery with filter buttons
- `http://localhost:3000/events/upcoming` — flyer card grid
- `http://localhost:3000/events/sound-of-colombo-2026` — event detail with ticket phases + modal
- `http://localhost:3000/about` — story + team grid

Check for:
- [ ] Black background, white text visible on all pages
- [ ] Navbar "Menu" button opens full-screen overlay; "Fermer le menu" closes it
- [ ] Ambient clock ticking in navbar
- [ ] Custom cursor dot visible on desktop, absent on mobile
- [ ] Scroll reveals trigger as sections enter viewport
- [ ] Hero carousel auto-advances
- [ ] Selecting a ticket phase opens `EmailCaptureModal`
- [ ] Submitting the email form shows confirmation text
- [ ] Filter buttons in Past Events update the gallery

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass — Phase 1 SNT website complete"
```

---

## Spec Coverage Self-Review

| Requirement | Task |
|---|---|
| Next.js App Router + TypeScript + Tailwind v4 | Task 1, 3 |
| K72 design system: colors, type, spacing tokens | Task 3 |
| Lausanne font @font-face placeholder | Task 3 |
| Full-screen menu overlay + stagger | Task 12 |
| Lenis smooth scroll | Task 9 |
| GSAP-equivalent word-split headline reveal | Task 8 |
| Custom cursor (dot + ring, lime on hover) | Task 10 |
| Ambient city clock | Task 11 |
| clamp() responsive type scaling | Task 3 |
| Hero autoplay carousel (video/image slides) | Task 15 |
| Home: about teaser, featured past work, upcoming strip | Task 16 |
| Scroll-reveal on each home section | Task 8, 16 |
| Past Events masonry gallery | Task 18, 19 |
| Filter (year + type) | Task 18 |
| Lightbox / modal with video playback | Task 17 |
| Upcoming Events flyer grid (handles varying aspect ratios) | Task 20, 21 |
| Event Detail: flyer, title, date, venue, lineup, description | Task 24 |
| Ticket Phases as selectable cards | Task 22 |
| Email Capture Modal + confirmation message | Task 23 |
| POST to `/api/ticket-requests` | Task 5, 23 |
| Loading / error / sold-out states | Task 22, 23 |
| About: team grid + company story | Task 25, 26 |
| Placeholder media: labeled, correctly sized, swappable arrays | Task 6, 7 |
| `lib/api.ts` typed fetch wrappers with `NEXT_PUBLIC_API_URL` | Task 5 |
| Graceful API error fallback to placeholder data | Task 16, 19, 21, 24 |
| Accessible: aria labels, keyboard-navigable modal, semantic HTML | All tasks |
| Mobile-first responsive | All tasks (clamp, grid cols) |
| Logo files: white + black in `/public` | Task 1 |
