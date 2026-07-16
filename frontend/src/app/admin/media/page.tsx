'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  HeroVideoSlot,
  MediaItem,
  AdminEvent,
  getHeroVideoSlots,
  deleteHeroVideoSlot,
  uploadHeroVideoWithProgress,
  getAdminEvents,
  getAdminEvent,
  uploadPhotosWithProgress,
  reorderMedia,
  deleteMedia,
} from '@/lib/adminApi'

// ── Confirm dialog ─────────────────────────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#111] border border-[#4d4d4d] rounded p-6 w-80 space-y-4">
        <p className="text-[13px] text-white/80 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[12px] text-white/50 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[12px] bg-[#d3fd50] text-black font-medium rounded hover:bg-[#c0e840] transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Hero video slot card ───────────────────────────────────────────────────────

function VideoSlotCard({
  slot,
  onSlotUpdated,
}: {
  slot: HeroVideoSlot
  onSlotUpdated: (updated: HeroVideoSlot) => void
}) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setProgress(0)
    try {
      const result = await uploadHeroVideoWithProgress(slot.slotNumber, file, setProgress)
      onSlotUpdated(result.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setProgress(null)
    }
  }

  const handleRemove = async () => {
    setError(null)
    try {
      const result = await deleteHeroVideoSlot(slot.slotNumber)
      onSlotUpdated(result.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Remove failed')
    }
  }

  return (
    <div className="border border-[#4d4d4d] rounded-lg overflow-hidden bg-[#0a0a0a]">
      {/* Slot label */}
      <div className="px-4 py-3 border-b border-[#4d4d4d] flex items-center justify-between">
        <span className="text-[11px] tracking-[0.2em] uppercase text-white/40">
          Slot {slot.slotNumber}
        </span>
        {slot.videoUrl && progress === null && (
          <button
            onClick={() => setConfirm(true)}
            className="text-[11px] text-white/30 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Preview / empty state */}
      <div className="aspect-video relative bg-[#111]">
        {slot.videoUrl ? (
          <video
            src={slot.videoUrl}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border border-dashed border-[#4d4d4d] rounded flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4d4d4d" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-[11px] text-white/25">Empty</span>
          </div>
        )}

        {/* Upload progress overlay */}
        {progress !== null && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
            <div className="w-3/4 h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d3fd50] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] text-white/60">{progress}%</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 space-y-2">
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            handleFile(file)
            e.target.value = ''
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="w-full py-2 text-[12px] border border-[#4d4d4d] rounded text-white/60 hover:border-[#d3fd50] hover:text-[#d3fd50] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {slot.videoUrl ? 'Replace' : 'Upload'}
        </button>
      </div>

      {confirm && (
        <ConfirmDialog
          message={`Remove video from Slot ${slot.slotNumber}? This cannot be undone.`}
          onConfirm={() => { setConfirm(false); handleRemove() }}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  )
}

// ── Sortable photo card ────────────────────────────────────────────────────────

function SortablePhotoCard({
  item,
  isFirst,
  onDelete,
}: {
  item: MediaItem
  isFirst: boolean
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const [confirm, setConfirm] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="aspect-square bg-[#111] rounded overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt="" className="w-full h-full object-cover" />
      </div>

      {isFirst && (
        <span className="absolute top-1.5 left-1.5 bg-[#d3fd50] text-black text-[9px] font-semibold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-sm">
          Cover
        </span>
      )}

      <button
        onClick={() => setConfirm(true)}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/80"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {confirm && (
        <ConfirmDialog
          message="Delete this photo? This cannot be undone."
          onConfirm={() => { setConfirm(false); onDelete(item.id) }}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  )
}

// ── Homepage Videos tab ────────────────────────────────────────────────────────

function HomepageVideosTab() {
  const [slots, setSlots] = useState<HeroVideoSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getHeroVideoSlots()
      .then((r) => setSlots(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSlotUpdated = (updated: HeroVideoSlot) => {
    setSlots((prev) => prev.map((s) => (s.slotNumber === updated.slotNumber ? updated : s)))
  }

  if (loading) return <div className="text-[13px] text-white/30 py-8">Loading...</div>

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-950/40 border border-red-800/50 rounded text-[12px] text-red-300">
          {error}
        </div>
      )}
      <p className="text-[12px] text-white/40 leading-relaxed">
        Manage the 5 video slots shown on the homepage hero. Upload MP4 or WebM files.
        Videos are stored on the server.
      </p>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {slots.map((slot) => (
          <VideoSlotCard key={slot.id} slot={slot} onSlotUpdated={handleSlotUpdated} />
        ))}
      </div>
    </div>
  )
}

// ── Event Photos tab ───────────────────────────────────────────────────────────

function EventPhotosTab() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [photos, setPhotos] = useState<MediaItem[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    getAdminEvents()
      .then((r) => setEvents(r.data))
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!selectedEventId) return
    setLoadingPhotos(true)
    setError(null)
    getAdminEvent(selectedEventId)
      .then((r) => setPhotos(r.data.media))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingPhotos(false))
  }, [selectedEventId])

  const uploadFiles = async (files: File[]) => {
    if (!selectedEventId || files.length === 0) return
    setError(null)
    setUploadProgress(0)
    try {
      const result = await uploadPhotosWithProgress(selectedEventId, files, setUploadProgress)
      setPhotos((prev) => [...prev, ...result.data])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploadProgress(null)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
      if (files.length) uploadFiles(files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedEventId]
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(photos, oldIndex, newIndex)
    setPhotos(reordered)
    try {
      await reorderMedia(selectedEventId, reordered.map((p) => p.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reorder failed')
    }
  }

  const handleDelete = async (mediaId: string) => {
    setError(null)
    try {
      await deleteMedia(selectedEventId, mediaId)
      setPhotos((prev) => prev.filter((p) => p.id !== mediaId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-950/40 border border-red-800/50 rounded text-[12px] text-red-300">
          {error}
        </div>
      )}

      {/* Event selector */}
      <div className="space-y-2">
        <label className="text-[11px] tracking-[0.15em] uppercase text-white/40">Event</label>
        <select
          value={selectedEventId}
          onChange={(e) => { setSelectedEventId(e.target.value); setPhotos([]) }}
          className="bg-[#111] border border-[#4d4d4d] rounded px-3 py-2 text-[13px] text-white w-72 focus:outline-none focus:border-[#d3fd50]"
        >
          <option value="">Select an event...</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {selectedEventId && (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
              isDragOver
                ? 'border-[#d3fd50] bg-[#d3fd50]/5'
                : 'border-[#4d4d4d] hover:border-[#4d4d4d]/80'
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDragOver ? '#d3fd50' : '#4d4d4d'} strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <p className="text-[12px] text-white/40 text-center">
              Drag & drop photos here, or click to browse
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                if (files.length) uploadFiles(files)
                e.target.value = ''
              }}
            />
          </div>

          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/40">Uploading…</span>
              <div className="flex-1 h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d3fd50] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-white/30 w-8 text-right">{uploadProgress}%</span>
            </div>
          )}

          {/* Photo grid */}
          {loadingPhotos ? (
            <div className="text-[13px] text-white/30 py-4">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="text-[12px] text-white/25 py-4">No photos yet for this event.</div>
          ) : (
            <>
              <p className="text-[11px] text-white/30">
                Drag to reorder — first photo is the cover image shown in listings.
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                    {photos.map((photo, i) => (
                      <SortablePhotoCard
                        key={photo.id}
                        item={photo}
                        isFirst={i === 0}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [tab, setTab] = useState<'videos' | 'photos'>('videos')

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-[22px] font-light tracking-tight mb-6">Media</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#4d4d4d] mb-8">
        {[
          { key: 'videos' as const, label: 'Homepage Videos' },
          { key: 'photos' as const, label: 'Event Photos' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-3 text-[13px] tracking-wide border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-[#d3fd50] text-[#d3fd50]'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'videos' ? <HomepageVideosTab /> : <EventPhotosTab />}
    </div>
  )
}
