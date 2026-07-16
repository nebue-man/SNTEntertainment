const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('snt_admin_token')
}
export function setToken(token: string) {
  sessionStorage.setItem('snt_admin_token', token)
}
export function clearToken() {
  sessionStorage.removeItem('snt_admin_token')
}
export function isLoggedIn(): boolean {
  return !!getToken()
}

// ── Fetch wrapper ─────────────────────────────────────────────────────────────

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const isFormData = init?.body instanceof FormData

  const headers: Record<string, string> = {}
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...headers, ...(init?.headers as Record<string, string> ?? {}) },
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/admin/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminEvent {
  id: string
  slug: string
  title: string
  venue: string
  eventDate: string
  status: 'UPCOMING' | 'PAST'
  flyerUrl: string | null
  createdAt: string
  _count: { ticketRequests: number }
}

export interface Artist {
  id: string
  name: string
  role: string
}

export interface Phase {
  id: string
  name: string
  price: string
  currency: string
  quantityAvailable: number
  quantitySold: number
  isActive: boolean
  sortOrder: number
}

export interface MediaItem {
  id: string
  type: 'PHOTO' | 'VIDEO'
  url: string
  cloudinaryPublicId: string
  sortOrder: number
}

export interface AdminEventDetail extends AdminEvent {
  description: string
  artists: Artist[]
  media: MediaItem[]
  phases: Phase[]
}

export interface TicketRequest {
  id: string
  email: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  priceAtRequest: string
  adminNotes: string | null
  paymentSlipUrl: string
  createdAt: string
  updatedAt: string
  event: { id: string; slug: string; title: string }
  phase: { id: string; name: string }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const adminLogin = (email: string, password: string) =>
  adminFetch<{ data: { token: string } }>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const adminLogout = () =>
  adminFetch<void>('/api/admin/auth/logout', { method: 'POST' })

// ── Events ────────────────────────────────────────────────────────────────────

export const getAdminEvents = () =>
  adminFetch<{ data: AdminEvent[] }>('/api/admin/events')

export const getAdminEvent = (id: string) =>
  adminFetch<{ data: AdminEventDetail }>(`/api/admin/events/${id}`)

export const createEvent = (form: FormData) =>
  adminFetch<{ data: AdminEvent }>('/api/admin/events', { method: 'POST', body: form })

export const updateEvent = (id: string, form: FormData) =>
  adminFetch<{ data: AdminEvent }>(`/api/admin/events/${id}`, { method: 'PATCH', body: form })

export const deleteEvent = (id: string) =>
  adminFetch<void>(`/api/admin/events/${id}`, { method: 'DELETE' })

// ── Artists ───────────────────────────────────────────────────────────────────

export const replaceArtists = (eventId: string, artists: { name: string; role: string }[]) =>
  adminFetch<{ data: Artist[] }>(`/api/admin/events/${eventId}/artists`, {
    method: 'PUT',
    body: JSON.stringify({ artists }),
  })

// ── Phases ────────────────────────────────────────────────────────────────────

export const createPhase = (eventId: string, data: Record<string, unknown>) =>
  adminFetch<{ data: Phase }>(`/api/admin/events/${eventId}/phases`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updatePhase = (eventId: string, phaseId: string, data: Record<string, unknown>) =>
  adminFetch<{ data: Phase }>(`/api/admin/events/${eventId}/phases/${phaseId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deletePhase = (eventId: string, phaseId: string) =>
  adminFetch<void>(`/api/admin/events/${eventId}/phases/${phaseId}`, { method: 'DELETE' })

// ── Media ─────────────────────────────────────────────────────────────────────

export function uploadPhotosWithProgress(
  eventId: string,
  files: File[],
  onProgress: (pct: number) => void
): Promise<{ data: MediaItem[] }> {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const form = new FormData()
    for (const file of files) form.append('photos', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API}/api/admin/events/${eventId}/media`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.withCredentials = true

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else if (xhr.status === 401) {
        clearToken()
        window.location.href = '/admin/login'
        reject(new Error('Unauthorized'))
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText).error ?? `HTTP ${xhr.status}`)) }
        catch { reject(new Error(`HTTP ${xhr.status}`)) }
      }
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(form)
  })
}

export const reorderMedia = (eventId: string, order: string[]) =>
  adminFetch<void>(`/api/admin/events/${eventId}/media/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ order }),
  })

export const deleteMedia = (eventId: string, mediaId: string) =>
  adminFetch<void>(`/api/admin/events/${eventId}/media/${mediaId}`, { method: 'DELETE' })

// ── Ticket Requests ───────────────────────────────────────────────────────────

export const getTicketRequests = (params: { eventId?: string; status?: string; page?: number }) => {
  const q = new URLSearchParams()
  if (params.eventId) q.set('eventId', params.eventId)
  if (params.status) q.set('status', params.status)
  if (params.page) q.set('page', String(params.page))
  return adminFetch<{ data: TicketRequest[]; meta: { total: number; page: number; limit: number } }>(
    `/api/admin/ticket-requests?${q}`
  )
}

export const getTicketRequest = (id: string) =>
  adminFetch<{ data: TicketRequest & { paymentSlipUrl: string } }>(`/api/admin/ticket-requests/${id}`)

export const updateTicketStatus = (
  id: string,
  status: 'CONFIRMED' | 'REJECTED',
  adminNotes?: string
) =>
  adminFetch<{ data: TicketRequest }>(`/api/admin/ticket-requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNotes }),
  })

// ── Hero Videos ──────────────────────────────────────────────────────────────

export interface HeroVideoSlot {
  id: string
  slotNumber: number
  videoUrl: string | null
  cloudinaryPublicId: string | null
  updatedAt: string
}

export const getHeroVideoSlots = () =>
  adminFetch<{ data: HeroVideoSlot[] }>('/api/admin/hero-videos')

export const deleteHeroVideoSlot = (slotNumber: number) =>
  adminFetch<{ data: HeroVideoSlot }>(`/api/admin/hero-videos/${slotNumber}`, {
    method: 'DELETE',
  })

export function uploadHeroVideoWithProgress(
  slotNumber: number,
  file: File,
  onProgress: (pct: number) => void
): Promise<{ data: HeroVideoSlot }> {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const form = new FormData()
    form.append('video', file)

    const xhr = new XMLHttpRequest()
    xhr.open('PATCH', `${API}/api/admin/hero-videos/${slotNumber}`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.withCredentials = true

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else if (xhr.status === 401) {
        clearToken()
        window.location.href = '/admin/login'
        reject(new Error('Unauthorized'))
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText).error ?? `HTTP ${xhr.status}`)) }
        catch { reject(new Error(`HTTP ${xhr.status}`)) }
      }
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(form)
  })
}

// ── Settings ──────────────────────────────────────────────────────────────────

export const getAdminSettings = () =>
  adminFetch<{ data: Record<string, string> }>('/api/admin/settings')

export const updateSetting = (key: string, value: string) =>
  adminFetch<{ data: { key: string; value: string } }>(`/api/admin/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  })
