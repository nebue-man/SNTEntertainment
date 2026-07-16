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
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, ...options },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error('Cloudinary upload returned no result'))
        }
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )

    const readable = new Readable()
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
