import type { Event, TicketRequest, TicketRequestResponse } from '@/lib/types'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  const res = await fetch(`${base}${path}`, {
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
