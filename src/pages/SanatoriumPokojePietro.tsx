import { Link, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useRoomsFromSheet } from '../hooks/useRoomsFromSheet'

const FILE_ID = '1iIoeZYMJ6K0tGunOtGphW-Ud5K1S_d0VJO2ozB7YW7E'
const GID = '154932015'

export default function SanatoriumPokojePietro() {
  const seconds = useIdleSecondsLeft(60_000)
  const { floor = '' } = useParams<{ floor: string }>()
  const { items, loading, error } = useRoomsFromSheet(FILE_ID, GID)

  const rooms = items
    .filter(r => r.floor === floor)
    .sort((a, b) => {
      const na = Number(a.roomNumber), nb = Number(b.roomNumber)
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
      return a.roomNumber.localeCompare(b.roomNumber, 'pl')
    })

  return (
    <div className="kiosk-container view-sanatorium-pokoje">
      <TopBar />
      <ViewHeading title={`Pokoje — piętro ${floor}`} color="orange" />

      <section className="content-container">
        <h3 style={{ textAlign: 'left', width: '100%' }}>Wybierz pokój:</h3>
        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}
        {!loading && !error && rooms.length === 0 && (
          <p>Brak pokoi dla piętra „{floor}”.</p>
        )}

        {!loading && !error && rooms.length > 0 && (
          <ul className="rooms-list">
            {rooms.map(r => (
              <li key={`${r.floor}-${r.roomNumber}`} className="rooms-list__item">
                <Link
                  className="rooms-list__link"
                  to={`/sanatorium-pokoje/${encodeURIComponent(floor)}/${encodeURIComponent(r.roomNumber)}`}
                >
                  <strong>Pokój {r.roomNumber}</strong>
                  {r.title ? <> — {r.title}</> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="row-nav" style={{ display: 'none' }}>
          <Link className="kiosk-btn kiosk-btn--outline" to="/sanatorium-pokoje">Wróć do listy pięter</Link>
        </div>
      </section>

      <BottomBackBar
        secondsLeft={seconds}
        backTo={`/sanatorium-pokoje`}
      />
    </div>
  )
}
