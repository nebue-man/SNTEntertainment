import { render, screen, fireEvent } from '@testing-library/react'
import EventFilter from '@/components/events/EventFilter'

const years = [2023, 2024, 2025]

it('renders All, Videos, Photos, and year buttons', () => {
  render(<EventFilter years={years} activeYear={null} activeType={null} onYear={() => {}} onType={() => {}} />)
  expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Videos' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Photos' })).toBeInTheDocument()
  years.forEach((y) => expect(screen.getByRole('button', { name: String(y) })).toBeInTheDocument())
})

it('calls onYear when a year button is clicked', () => {
  const onYear = jest.fn()
  render(<EventFilter years={years} activeYear={null} activeType={null} onYear={onYear} onType={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: '2024' }))
  expect(onYear).toHaveBeenCalledWith(2024)
})

it('calls onType when Videos is clicked', () => {
  const onType = jest.fn()
  render(<EventFilter years={years} activeYear={null} activeType={null} onYear={() => {}} onType={onType} />)
  fireEvent.click(screen.getByRole('button', { name: 'Videos' }))
  expect(onType).toHaveBeenCalledWith('video')
})
