import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useRoomsFromSheetCsv } from '../hooks/useRoomsFromSheetCsv'
import RoomCarousel from '../components/RoomCarousel'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '154932015'

export default function SanatoriumPokoje() {
  const seconds = useIdleSecondsLeft(60_000)
  const { items, loading, error } = useRoomsFromSheetCsv(FILE_ID, GID)

  const [idx, setIdx] = useState(0)
  useEffect(() => { if (!loading) setIdx(0) }, [loading])
  const room = items[idx]
  const canPrev = idx > 0
  const canNext = idx < items.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canPrev) setIdx(i => i - 1)
      if (e.key === 'ArrowRight' && canNext) setIdx(i => i + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canPrev, canNext])

  return (
    <div className="kiosk-container view-sanatorium-pokoje">
      <TopBar />
      <ViewHeading title="Pokoje" color="orange" />

      <div className="room-viewer">
        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}
        {!loading && !error && items.length === 0 && <p>Brak danych o pokojach.</p>}

        {!loading && !error && room && (
          <article className="room-card">
            {room.title && <h2 className="room-title">{room.title}</h2>}
            {room.content && <div className="room-desc preline">{room.content}</div>}

            {room.images.length > 0 && (
              <RoomCarousel images={room.images} title={room.title} />
            )}

            <div className="room-nav">
              <button className="kiosk-btn kiosk-btn--outline" onClick={() => canPrev && setIdx(i => i - 1)} disabled={!canPrev}>Wstecz</button>

              <div className="room-counter">
                {idx + 1} / {items.length}
              </div>

              <button className="kiosk-btn kiosk-btn--outline" onClick={() => canNext && setIdx(i => i + 1)} disabled={!canNext}>Dalej</button>
            </div>
          </article>
        )}
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
