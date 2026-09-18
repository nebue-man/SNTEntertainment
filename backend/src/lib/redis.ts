import Redis from 'ioredis'

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL
  if (!url) {
    console.warn('[redis] REDIS_URL not set — caching disabled')
    return null
  }

  const client = new Redis(url, {
    // Reject commands immediately when disconnected rather than queuing them.
    // This ensures cache misses fall through to the DB instantly rather than
    // waiting for Redis to reconnect under a backlog.
    enableOfflineQueue: false,
    // One retry per command is enough — we want fast fallback, not persistence.
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  })

  client.on('error', (err: Error) => {
    // Log but never throw — cache errors must not crash the request pipeline.
    console.warn('[redis] error:', err.message)
  })

  client.on('connect', () => {
    console.log('[redis] connected')
  })

  return client
}

export const redis = createRedisClient()
