'use client'

type MediaType = 'video' | 'photo'

interface Props {
  years: number[]
  activeYear: number | null
  activeType: MediaType | null
  onYear: (year: number | null) => void
  onType: (type: MediaType | null) => void
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="text-caption tracking-widest uppercase px-4 py-2 border transition-colors"
      style={{
        borderColor: active ? 'var(--color-ghost-white)' : 'var(--color-pewter)',
        color: active ? 'var(--color-ghost-white)' : 'var(--color-pewter)',
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </button>
  )
}

export default function EventFilter({ years, activeYear, activeType, onYear, onType }: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Filter gallery">
      <FilterBtn active={!activeType && !activeYear} onClick={() => { onType(null); onYear(null) }}>
        All
      </FilterBtn>
      <FilterBtn active={activeType === 'video'} onClick={() => onType(activeType === 'video' ? null : 'video')}>
        Videos
      </FilterBtn>
      <FilterBtn active={activeType === 'photo'} onClick={() => onType(activeType === 'photo' ? null : 'photo')}>
        Photos
      </FilterBtn>
      <span className="w-px h-5 bg-pewter/30 mx-1" aria-hidden />
      {years.map((y) => (
        <FilterBtn key={y} active={activeYear === y} onClick={() => onYear(activeYear === y ? null : y)}>
          {y}
        </FilterBtn>
      ))}
    </div>
  )
}
