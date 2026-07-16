import type { TeamMember } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'

interface Props { member: TeamMember }

export default function TeamMemberCard({ member }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-[4/5] border border-pewter/30 overflow-hidden">
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
            aspectRatio="4/5"
            type="image"
          />
        )}
      </div>
      <div>
        <p className="text-body text-ghost-white font-light">{member.name}</p>
        <p className="text-body-sm text-electric-lime">{member.role}</p>
        <p className="text-body-sm text-pewter mt-2 leading-relaxed">{member.bio}</p>
      </div>
    </div>
  )
}
