'use client'

import { motion } from 'framer-motion'
import type { TeamMember } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'

interface Props {
  member: TeamMember
  isExpanded: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

export default function TeamMemberCard({ member, isExpanded, onMouseEnter, onMouseLeave, onClick }: Props) {
  return (
    <div
      className="flex flex-col gap-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="aspect-square border border-pewter/30 overflow-hidden">
        {member.photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoSrc}
            alt={`${member.name} — ${member.role}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <PlaceholderMedia
            label={`${member.name} — portrait photo (replace with client asset)`}
            aspectRatio="1/1"
            type="image"
          />
        )}
      </div>

      <div>
        <p className="text-body text-ghost-white font-light">{member.name}</p>
        <p className="text-body-sm text-electric-lime">{member.role}</p>

        {/* Bio — animates from height 0 → auto on expand */}
        <motion.div
          initial={false}
          animate={
            isExpanded
              ? { height: 'auto', opacity: 1, pointerEvents: 'auto' as const }
              : { height: 0,      opacity: 0, pointerEvents: 'none' as const }
          }
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <p className="text-body-sm text-pewter mt-2 leading-relaxed">{member.bio}</p>
        </motion.div>
      </div>
    </div>
  )
}
