'use client'

import { useState } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import TicketPhaseCard from '@/components/events/TicketPhaseCard'
import EmailCaptureModal from '@/components/events/EmailCaptureModal'
import type { TicketPhase } from '@/lib/types'

interface Props {
  eventId: string
  phases: TicketPhase[]
}

export default function EventTicketSection({ eventId, phases }: Props) {
  const [selectedPhase, setSelectedPhase] = useState<TicketPhase | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function handleSelect(phase: TicketPhase) {
    setSelectedPhase(phase)
    setModalOpen(true)
  }

  return (
    <>
      <ScrollReveal>
        <div className="border-t border-pewter/20 pt-16">
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Tickets</p>
          <p className="text-body-sm text-pewter mb-10 max-w-md leading-relaxed">
            Select a ticket phase to request your spot. Our team will contact you with payment
            details by email.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
            {phases.map((phase) => (
              <TicketPhaseCard
                key={phase.id}
                phase={phase}
                selected={selectedPhase?.id === phase.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </ScrollReveal>

      {selectedPhase && (
        <EmailCaptureModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          eventId={eventId}
          phaseId={selectedPhase.id}
          phaseName={selectedPhase.name}
        />
      )}
    </>
  )
}
