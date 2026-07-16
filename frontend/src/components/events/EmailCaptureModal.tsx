'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createTicketRequest } from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
  eventId: string
  phaseName: string
  phaseId: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function EmailCaptureModal({ open, onClose, eventId, phaseName, phaseId }: Props) {
  const [email, setEmail]           = useState('')
  const [status, setStatus]         = useState<Status>('idle')
  const [errorMsg, setErrorMsg]     = useState('')
  const [fieldError, setFieldError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setStatus('idle')
    setErrorMsg('')
    setFieldError('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Please enter a valid email address.')
      return
    }
    setFieldError('')
    setStatus('loading')
    try {
      await createTicketRequest({ eventId, phaseId, email: trimmed })
      setStatus('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setErrorMsg(msg.toLowerCase().includes('sold') ? 'This phase is sold out.' : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-absolute-zero/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md border border-pewter/30 bg-absolute-zero p-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-caption text-electric-lime tracking-widest uppercase mb-1">
                  Ticket Request
                </p>
                <h2 id="modal-title" className="text-heading-sm text-ghost-white font-light">
                  {phaseName}
                </h2>
              </div>
              <button onClick={onClose} aria-label="Close modal" className="text-pewter hover:text-ghost-white transition-colors mt-1">
                <X size={20} />
              </button>
            </div>

            {status === 'success' ? (
              <div className="py-4">
                <p className="text-body text-ghost-white leading-relaxed">
                  {`Thanks! We've received your request for ${phaseName}. Our team will email you shortly with payment details.`}
                </p>
                <button
                  onClick={onClose}
                  className="mt-8 text-caption text-pewter hover:text-ghost-white tracking-widest uppercase transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-6">
                  <label htmlFor="ticket-email" className="block text-body-sm text-pewter mb-2">
                    Email address
                  </label>
                  <input
                    ref={inputRef}
                    id="ticket-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldError('') }}
                    placeholder="your@email.com"
                    className="w-full bg-transparent border border-pewter/30 focus:border-ghost-white px-5 py-4 text-body text-ghost-white placeholder:text-pewter/50 outline-none transition-colors"
                    aria-describedby={fieldError ? 'field-error' : undefined}
                    aria-invalid={!!fieldError}
                  />
                  {fieldError && (
                    <p id="field-error" className="text-caption text-red-400 mt-2">
                      {fieldError}
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <p className="text-caption text-red-400 mb-4">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full border border-ghost-white text-ghost-white text-body-sm tracking-widest uppercase py-4 px-6 hover:bg-ghost-white hover:text-absolute-zero transition-colors disabled:opacity-50"
                  aria-label="Submit ticket request"
                >
                  {status === 'loading' ? 'Sending…' : 'Submit Request'}
                </button>

                <p className="text-caption text-pewter/60 mt-4 leading-relaxed">
                  We&apos;ll email you payment details. No card required now.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
