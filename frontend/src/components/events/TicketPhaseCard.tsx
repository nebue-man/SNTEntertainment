'use client'

import type { TicketPhase } from '@/lib/types'

interface Props {
  phase: TicketPhase
  selected: boolean
  onSelect: (phase: TicketPhase) => void
}

export default function TicketPhaseCard({ phase, selected, onSelect }: Props) {
  const unavailable = !phase.isActive || phase.isSoldOut

  return (
    <button
      onClick={() => !unavailable && onSelect(phase)}
      disabled={unavailable}
      aria-pressed={selected}
      aria-label={`${phase.name} — ${phase.currency} ${phase.price.toLocaleString()}${phase.isSoldOut ? ' — Sold out' : !phase.isActive ? ' — Not available yet' : ''}`}
      className="w-full text-left border transition-colors duration-200 p-6 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: selected ? 'var(--color-ghost-white)' : 'var(--color-pewter)',
        backgroundColor: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-body-lg text-ghost-white font-light">{phase.name}</p>
          {phase.isSoldOut && (
            <p className="text-caption text-electric-lime tracking-widest uppercase mt-1">Sold out</p>
          )}
          {!phase.isSoldOut && !phase.isActive && (
            <p className="text-caption text-pewter tracking-widest uppercase mt-1">Coming soon</p>
          )}
        </div>
        <p className="text-body-lg text-ghost-white font-light whitespace-nowrap">
          {phase.currency} {phase.price.toLocaleString()}
        </p>
      </div>

      {selected && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-electric-lime)' }}
          />
          <span className="text-caption text-electric-lime tracking-widest uppercase">Selected</span>
        </div>
      )}
    </button>
  )
}
