import 'dotenv/config'
import app from './app'

const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const

const missing = REQUIRED_ENV.filter((k) => !process.env[k])
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

const PORT = parseInt(process.env.PORT ?? '4000', 10)

app.listen(PORT, () => {
  console.log(`SNT backend running on port ${PORT}`)
})
