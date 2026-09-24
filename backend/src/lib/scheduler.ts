import cron from 'node-cron'
import { prisma } from './prisma'

async function transitionPastEvents() {
  try {
    const result = await prisma.event.updateMany({
      where: {
        status:    'UPCOMING',
        eventDate: { lt: new Date() },
      },
      data: { status: 'PAST' },
    })
    if (result.count > 0) {
      console.log(`[scheduler] Transitioned ${result.count} event(s) from UPCOMING → PAST`)
    }
  } catch (err) {
    console.error('[scheduler] Failed to transition past events:', err)
  }
}

export function startScheduler() {
  // Run immediately on startup to catch any events that passed while server was down
  transitionPastEvents()

  // Then run every hour at :00
  cron.schedule('0 * * * *', transitionPastEvents)

  console.log('[scheduler] Event auto-transition scheduler started')
}
