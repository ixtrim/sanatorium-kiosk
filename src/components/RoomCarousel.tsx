import { useEffect, useMemo, useState } from 'react'

type Props = {
  images: string[]
  title?: string
  className?: string
}

/** Minimal, dependency-free carousel for a room's images */
export default function RoomCarousel({ images, title, className }: Props) {
  const [idx, setIdx] = useState(0)
  const canPrev = idx > 0
  const canNext = idx < images.length - 1

  // Reset on images change
  useEffect(() => setIdx(0), [images.join('|')])

  // Preload neighbors for smoother transitions
  useEffect(() => {
    const preload = (i: number) => {
      if (i >= 0 && i < images.length) {
        const im = new Image()
        im.src = images[i]
      }
    }
    preload(idx + 1)
    preload(idx - 1)
  }, [idx, images])

  // If an image fails, skip it
  const safeImages = useMemo(() => images.filter(Boolean), [images])

  if (safeImages.length === 0) return null

  return (
    <div className={`room-carousel ${className ?? ''}`}>
      <button
        type="button"
        className="room-carousel__arrow room-carousel__arrow--prev"
        onClick={() => canPrev && setIdx(i => i - 1)}
        disabled={!canPrev}
        aria-label="Poprzednie zdjęcie"
      >
        {/* left chevron */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <div className="room-carousel__viewport" aria-live="polite">
        <div
          className="room-carousel__track"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {safeImages.map((src, i) => (
            <figure className="room-carousel__slide" key={i}>
              <img
                src={src}
                alt={`${title || 'Pokój'} — zdjęcie ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </figure>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="room-carousel__arrow room-carousel__arrow--next"
        onClick={() => canNext && setIdx(i => i + 1)}
        disabled={!canNext}
        aria-label="Następne zdjęcie"
      >
        {/* right chevron */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div className="room-carousel__dots">
        {safeImages.map((_, i) => (
          <span
            key={i}
            className={`room-carousel__dot ${i === idx ? 'is-active' : ''}`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}
