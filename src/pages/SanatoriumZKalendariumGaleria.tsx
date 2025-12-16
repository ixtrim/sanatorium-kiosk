import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGalleriesFromSheet } from '../hooks/useGalleriesFromSheet'
import RoomCarousel from '../components/RoomCarousel'

const FILE_ID = '1iIoeZYMJ6K0tGunOtGphW-Ud5K1S_d0VJO2ozB7YW7E'
const GID = '1284341100'

export default function SanatoriumZKalendariumGaleria() {
  const seconds = useIdleSecondsLeft(60_000)
  const { idx = '0' } = useParams<{ idx: string }>()
  const selected = Math.max(0, parseInt(idx, 10) || 0)

  const { items, loading, error } = useGalleriesFromSheet(FILE_ID, GID)
  const gal = !loading && !error ? items[selected] : undefined

  return (
    <div className="kiosk-container view-sanatorium-pokoje">
      <TopBar />
      <ViewHeading title={gal?.title || 'Galeria'} color="orange" />

      <section className="content-container room-viewer gallery-viewer">
        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}
        {!loading && !error && !gal && <p>Nie znaleziono galerii.</p>}

        {!loading && !error && gal && (
          <article className="room-card">
            {gal.images.length > 0 && (
              <RoomCarousel images={gal.images} title={gal.title} />
            )}
          </article>
        )}
      </section>

      <BottomBackBar secondsLeft={seconds} backTo="/sanatorium-kalendarium" />
    </div>
  )
}