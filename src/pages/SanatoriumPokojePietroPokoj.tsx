import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useRoomsFromSheet } from '../hooks/useRoomsFromSheet'
import RoomCarousel from '../components/RoomCarousel'

const FILE_ID = '1iIoeZYMJ6K0tGunOtGphW-Ud5K1S_d0VJO2ozB7YW7E'
const GID = '154932015'

export default function SanatoriumPokojePietroPokoj() {
  const seconds = useIdleSecondsLeft(60_000)
  const { floor = '', room: roomParam = '' } = useParams<{ floor: string; room: string }>()
  const { items, loading, error } = useRoomsFromSheet(FILE_ID, GID)

  const roomsOnFloor = items.filter(r => r.floor === floor)
  const idx = roomsOnFloor.findIndex(r => r.roomNumber === roomParam)
  const room = idx >= 0 ? roomsOnFloor[idx] : undefined

  return (
    <div className="kiosk-container view-sanatorium-pokoje">
      <TopBar />
      <ViewHeading title={`Piętro ${floor} — pokój ${roomParam}`} color="orange" />

      <section className="content-container room-viewer">

        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}
        {!loading && !error && !room && (
          <p>Nie znaleziono pokoju „{roomParam}” na piętrze „{floor}”.</p>
        )}

        {!loading && !error && room && (
          <article className="room-card">
            {room.title && <h2 className="room-title">{room.title}</h2>}
            {room.content && <div className="room-desc preline">{room.content}</div>}
            {room.images.length > 0 && (
              <RoomCarousel images={room.images} title={room.title || `Pokój ${room.roomNumber}`} />
            )}
          </article>
        )}
      </section>

      <BottomBackBar
        secondsLeft={seconds}
        backTo={`/sanatorium-pokoje/${encodeURIComponent(floor)}`}
      />
    </div>
  )
}
