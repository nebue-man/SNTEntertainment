const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

/** Ensure a media URL sourced from the API is absolute.
 *  Relative paths (no protocol) are prefixed with the backend base URL. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${BASE}${url.startsWith('/') ? '' : '/'}${url}`
}
