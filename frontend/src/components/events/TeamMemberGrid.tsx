'use client'

import { useState, useEffect, useRef } from 'react'
import TeamMemberCard from '@/components/events/TeamMemberCard'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { teamMembers } from '@/lib/teamConfig'

export default function TeamMemberGrid() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // Detected once on mount; stable for the page session.
  const isTouchRef = useRef(false)

  useEffect(() => {
    isTouchRef.current = window.matchMedia('(pointer: coarse)').matches
  }, [])

  // Desktop — mouse enter expands, mouse leave collapses.
  // Cards are separated by a grid gap so there is no meaningful "between cards"
  // dead zone; the brief collapse while the mouse crosses the gap is masked by
  // the 380ms animation and is imperceptible in practice.
  function handleMouseEnter(id: string) {
    if (!isTouchRef.current) setExpandedId(id)
  }

  function handleMouseLeave() {
    if (!isTouchRef.current) setExpandedId(null)
  }

  // Touch — tap toggles this card; any other expanded card is collapsed first
  // (accordion). On touch, browsers fire a synthetic mouseenter after the tap,
  // but isTouchRef guards against it acting on those simulated events.
  function handleClick(id: string) {
    if (isTouchRef.current) {
      setExpandedId(prev => (prev === id ? null : id))
    }
  }

  return (
    // items-start: cards align to their own top edge so expanding one card
    // does not stretch sibling cards to match its new height.
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
      {teamMembers.map((member, i) => (
        <ScrollReveal key={member.id} delay={i * 0.08}>
          <TeamMemberCard
            member={member}
            isExpanded={expandedId === member.id}
            onMouseEnter={() => handleMouseEnter(member.id)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(member.id)}
          />
        </ScrollReveal>
      ))}
    </div>
  )
}
