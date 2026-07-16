import { getUpcomingEvents, getPastEvents, getEvent, createTicketRequest } from '@/lib/api'

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  process.env.NEXT_PUBLIC_API_URL = 'http://test-api.local'
})

function ok(body: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response)
}
function err(status: number, message: string) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ message }),
  } as Response)
}

describe('getUpcomingEvents', () => {
  it('fetches /api/events?status=upcoming', async () => {
    mockFetch.mockReturnValue(ok([{ id: '1', slug: 'test', title: 'T', status: 'upcoming' }]))
    const result = await getUpcomingEvents()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.local/api/events?status=upcoming',
      expect.objectContaining({ headers: expect.any(Object) })
    )
    expect(result[0].slug).toBe('test')
  })
})

describe('getPastEvents', () => {
  it('fetches /api/events?status=past', async () => {
    mockFetch.mockReturnValue(ok([]))
    await getPastEvents()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.local/api/events?status=past',
      expect.any(Object)
    )
  })
})

describe('getEvent', () => {
  it('fetches /api/events/:slug', async () => {
    mockFetch.mockReturnValue(ok({ id: '1', slug: 'my-event' }))
    const result = await getEvent('my-event')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.local/api/events/my-event',
      expect.any(Object)
    )
    expect(result.slug).toBe('my-event')
  })
})

describe('createTicketRequest', () => {
  it('POSTs to /api/ticket-requests', async () => {
    mockFetch.mockReturnValue(Promise.resolve({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ message: 'ok' }),
    } as Response))
    const result = await createTicketRequest({ eventId: 'e1', phaseId: 'p1', email: 'a@b.com' })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.local/api/ticket-requests',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ eventId: 'e1', phaseId: 'p1', email: 'a@b.com' }) })
    )
    expect(result.message).toBe('ok')
  })

  it('throws on 400', async () => {
    mockFetch.mockReturnValue(err(400, 'Invalid phase'))
    await expect(createTicketRequest({ eventId: 'e1', phaseId: 'p1', email: 'bad' }))
      .rejects.toThrow('Invalid phase')
  })

  it('throws on 409 sold out', async () => {
    mockFetch.mockReturnValue(err(409, 'Phase sold out'))
    await expect(createTicketRequest({ eventId: 'e1', phaseId: 'p1', email: 'a@b.com' }))
      .rejects.toThrow('Phase sold out')
  })
})
