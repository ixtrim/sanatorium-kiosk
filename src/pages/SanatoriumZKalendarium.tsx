import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGalleriesFromSheet } from '../hooks/useGalleriesFromSheet'

const FILE_ID = '1iIoeZYMJ6K0tGunOtGphW-Ud5K1S_d0VJO2ozB7YW7E'
const GID = '1284341100'

export default function SanatoriumZKalendarium() {
  const seconds = useIdleSecondsLeft(60_000)
  const { items, loading, error } = useGalleriesFromSheet(FILE_ID, GID)

  return (
    <div className="kiosk-container view-sanatorium-pokoje">
      <TopBar />
      <ViewHeading title="Z kalendarium sanatorium" color="orange" />

      <section className="content-container">
        <h3 style={{ textAlign: 'left', width: '100%' }}>Wybierz galerię:</h3>
        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}
        {!loading && !error && items.length === 0 && <p>Brak zdefiniowanych galerii.</p>}

        {!loading && !error && items.length > 0 && (
          <ul className="rooms-list">
            {items.map((g, i) => (
              <li className="rooms-list__item">
                <Link
                  key={`${i}-${g.title}`}
                  className="rooms-list__link"
                  to={`/sanatorium-kalendarium/${i}`}
                >
                  {g.title || `Galeria ${i + 1}`}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <BottomBackBar secondsLeft={seconds} backTo="/sanatorium" />
    </div>
  )
}
