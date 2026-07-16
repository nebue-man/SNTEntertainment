import { PrismaClient, EventStatus, MediaType } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const ALLOWED_SETTING_KEYS = [
  'bank_name',
  'account_name',
  'account_number',
  'branch',
  'payment_instructions',
] as const

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin ─────────────────────────────────────────────────────────────────
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before seeding.'
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })

  console.log(`  ✓ Admin: ${email}`)

  // ── Settings ──────────────────────────────────────────────────────────────
  const defaultSettings: Record<typeof ALLOWED_SETTING_KEYS[number], string> = {
    bank_name: 'Commercial Bank of Ceylon',
    account_name: 'SNT Live Events (Pvt) Ltd',
    account_number: '1234567890',
    branch: 'Colombo 03',
    payment_instructions:
      'Please use your email address as the payment reference. ' +
      'Upload a clear screenshot or photo of your payment confirmation. ' +
      'Your request will be confirmed within 24 hours.',
  }

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},          // Don't overwrite if already edited via admin API
      create: { key, value },
    })
  }

  console.log('  ✓ Settings seeded (bank details — update via admin API)')

  // ── Sample Events ─────────────────────────────────────────────────────────

  // 1. Upcoming — Sound of Colombo 2026
  const soc = await prisma.event.upsert({
    where: { slug: 'sound-of-colombo-2026' },
    update: {},
    create: {
      slug: 'sound-of-colombo-2026',
      title: 'Sound of Colombo 2026',
      description:
        "Sri Lanka's largest indoor music festival returns. Three stages, 20+ artists, " +
        'one unforgettable night at Nelum Pokuna Amphitheatre.',
      venue: 'Nelum Pokuna Amphitheatre, Colombo 07',
      eventDate: new Date('2026-09-20T18:00:00+05:30'),
      status: EventStatus.UPCOMING,
      flyerUrl: null,
      artists: {
        create: [
          { name: 'Paranaque', role: 'Headliner' },
          { name: 'Ranidu Lankage', role: 'Headliner' },
          { name: 'Dinesh Gamage & The Tribe', role: 'Supporting Act' },
          { name: 'Wasthi', role: 'Supporting Act' },
        ],
      },
      phases: {
        create: [
          {
            name: 'Early Bird',
            price: 2500,
            currency: 'LKR',
            quantityAvailable: 200,
            quantitySold: 187,
            isActive: true,
            sortOrder: 0,
          },
          {
            name: 'General Admission',
            price: 3500,
            currency: 'LKR',
            quantityAvailable: 500,
            quantitySold: 42,
            isActive: true,
            sortOrder: 1,
          },
          {
            name: 'VIP',
            price: 7500,
            currency: 'LKR',
            quantityAvailable: 100,
            quantitySold: 0,
            isActive: true,
            sortOrder: 2,
          },
        ],
      },
    },
  })

  console.log(`  ✓ Event: ${soc.title}`)

  // 2. Past — Bassline Kandy 2025
  const bk = await prisma.event.upsert({
    where: { slug: 'bassline-kandy-2025' },
    update: {},
    create: {
      slug: 'bassline-kandy-2025',
      title: 'Bassline Kandy 2025',
      description:
        'A night of bass-heavy beats at BMICH, Kandy. From reggae to drum & bass, ' +
        "Sri Lanka's hill capital came alive.",
      venue: 'BMICH Auditorium, Kandy',
      eventDate: new Date('2025-10-05T19:00:00+05:30'),
      status: EventStatus.PAST,
      flyerUrl: null,
      artists: {
        create: [
          { name: 'Iraj', role: 'Headliner' },
          { name: 'Sinhala Beats Collective', role: 'Supporting Act' },
        ],
      },
      media: {
        create: [
          {
            type: MediaType.PHOTO,
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            cloudinaryPublicId: 'sample',
            sortOrder: 0,
          },
          {
            type: MediaType.PHOTO,
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            cloudinaryPublicId: 'sample',
            sortOrder: 1,
          },
          {
            type: MediaType.VIDEO,
            url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
            cloudinaryPublicId: 'dog',
            sortOrder: 2,
          },
        ],
      },
    },
  })

  console.log(`  ✓ Event: ${bk.title}`)

  // 3. Past — Galle Groove Fest 2024
  const ggf = await prisma.event.upsert({
    where: { slug: 'galle-groove-fest-2024' },
    update: {},
    create: {
      slug: 'galle-groove-fest-2024',
      title: 'Galle Groove Fest 2024',
      description:
        'Open-air festival on the iconic Galle Face Green. ' +
        'An evening of jazz, soul, and Afrobeat as the ocean breeze rolls in.',
      venue: 'Galle Face Green, Colombo 03',
      eventDate: new Date('2024-11-14T17:00:00+05:30'),
      status: EventStatus.PAST,
      flyerUrl: null,
      artists: {
        create: [
          { name: 'Dropwizz', role: 'Headliner' },
          { name: 'Lahiru Perera Quartet', role: 'Opening Act' },
        ],
      },
      media: {
        create: [
          {
            type: MediaType.PHOTO,
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            cloudinaryPublicId: 'sample',
            sortOrder: 0,
          },
          {
            type: MediaType.PHOTO,
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            cloudinaryPublicId: 'sample',
            sortOrder: 1,
          },
        ],
      },
    },
  })

  console.log(`  ✓ Event: ${ggf.title}`)

  console.log('\n✅ Seed complete.')
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
