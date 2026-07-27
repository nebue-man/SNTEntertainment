import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export type ResourceType = 'image' | 'video' | 'raw'

export interface UploadResult {
  url: string
  publicId: string
}

export function uploadBuffer(
  buffer: Buffer,
  resourceType: ResourceType,
  options: Record<string, unknown> = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    let settled = false
    const done = (err: unknown, result?: UploadResult) => {
      if (settled) return
      settled = true
      if (err || !result) {
        reject(err instanceof Error ? err : new Error(JSON.stringify(err) || 'Cloudinary upload failed'))
      } else {
        resolve(result)
      }
    }

    let uploadStream: ReturnType<typeof cloudinary.uploader.upload_stream>
    try {
      // timeout: 600000 extends the socket inactivity timeout to 10 min for large video uploads.
      // The v2 SDK adapter signature is upload_stream(options, callback).
      uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, timeout: 600000, ...options },
        (error, result) => {
          if (error || !result) {
            done(error ?? new Error('Cloudinary upload returned no result'))
          } else {
            done(null, { url: result.secure_url, publicId: result.public_id })
          }
        }
      )
    } catch (err) {
      return done(err)
    }

    uploadStream.on('error', (err) => done(err))

    const readable = new Readable()
    readable.on('error', (err) => done(err))
    readable.push(buffer)
    readable.push(null)
    readable.pipe(uploadStream)
  })
}

export interface UploadSignature {
  timestamp: number
  signature: string
  apiKey: string
  cloudName: string
  folder: string
  resourceType: 'image' | 'video'
}

export function generateUploadSignature(
  folder: string,
  resourceType: 'image' | 'video'
): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )
  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
    resourceType,
  }
}

export async function deleteAsset(
  publicId: string,
  resourceType: ResourceType = 'image'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch {
    // Best-effort: log but don't throw — caller decides whether to surface this
    console.error(`[cloudinary] Failed to delete asset: ${publicId}`)
  }
}
