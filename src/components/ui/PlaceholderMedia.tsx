import { Film, Image as ImageIcon } from 'lucide-react'

interface Props {
  label: string
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/4' | '9/16'
  type?: 'video' | 'image'
  className?: string
}

const ratioClass: Record<NonNullable<Props['aspectRatio']>, string> = {
  '16/9': 'aspect-video',
  '4/3':  'aspect-[4/3]',
  '1/1':  'aspect-square',
  '3/4':  'aspect-[3/4]',
  '9/16': 'aspect-[9/16]',
}

export default function PlaceholderMedia({
  label,
  aspectRatio = '16/9',
  type = 'image',
  className = '',
}: Props) {
  return (
    <div
      className={`relative w-full ${ratioClass[aspectRatio]} border border-pewter/30 flex flex-col items-center justify-center gap-4 bg-absolute-zero/50 ${className}`}
    >
      <div className="text-pewter">
        {type === 'video' ? <Film size={32} strokeWidth={1} /> : <ImageIcon size={32} strokeWidth={1} />}
      </div>
      <p className="text-caption text-pewter text-center max-w-[200px] leading-relaxed px-4">
        {label}
      </p>
    </div>
  )
}
