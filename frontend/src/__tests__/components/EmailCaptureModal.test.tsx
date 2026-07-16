import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmailCaptureModal from '@/components/events/EmailCaptureModal'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
const mockCreate = api.createTicketRequest as jest.MockedFunction<typeof api.createTicketRequest>

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  eventId: 'evt-1',
  phaseName: 'Early Bird',
  phaseId: 'ph-1',
}

beforeEach(() => {
  jest.clearAllMocks()
})

it('renders the modal when open', () => {
  mockCreate.mockResolvedValue({ message: 'ok' })
  render(<EmailCaptureModal {...defaultProps} />)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('Early Bird')).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
})

it('shows validation error on empty submit', async () => {
  mockCreate.mockResolvedValue({ message: 'ok' })
  render(<EmailCaptureModal {...defaultProps} />)
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument()
  expect(mockCreate).not.toHaveBeenCalled()
})

it('calls createTicketRequest and shows confirmation', async () => {
  mockCreate.mockResolvedValue({ message: 'ok' })
  render(<EmailCaptureModal {...defaultProps} />)
  await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'fan@test.com')
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  await waitFor(() =>
    expect(mockCreate).toHaveBeenCalledWith({ eventId: 'evt-1', phaseId: 'ph-1', email: 'fan@test.com' })
  )
  expect(await screen.findByText(/we've received your request for early bird/i)).toBeInTheDocument()
})

it('shows error message on API failure', async () => {
  mockCreate.mockRejectedValue(new Error('Server error'))
  render(<EmailCaptureModal {...defaultProps} />)
  await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'fan@test.com')
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
})
