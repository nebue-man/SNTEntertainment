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
