import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useRoomsFromSheet } from '../hooks/useRoomsFromSheet'

const FILE_ID = '1iIoeZYMJ6K0tGunOtGphW-Ud5K1S_d0VJO2ozB7YW7E'
const GID = '154932015'

export default function SanatoriumPokoje() {
  const seconds = useIdleSecondsLeft(60_000)
  const { items, loading, error } = useRoomsFromSheet(FILE_ID, GID)

  // Zbuduj mapę zakresów pokoi dla każdego piętra
  const rangeByFloor = new Map<string, { min: number; max: number }>()
  const floorSet = new Set<string>()

  for (const r of items) {
    const floor = String((r as any).floor ?? '').trim()
    if (!floor) continue
    floorSet.add(floor)

    // wyciągnij numer pokoju jako liczbę (ignoruje ew. znaki nienumeryczne)
    const rnMatch = String((r as any).roomNumber ?? '').match(/\d+/)
    const rn = rnMatch ? parseInt(rnMatch[0], 10) : NaN
    if (!Number.isFinite(rn)) continue

    const prev = rangeByFloor.get(floor)
    if (prev) {
      if (rn < prev.min) prev.min = rn
      if (rn > prev.max) prev.max = rn
    } else {
      rangeByFloor.set(floor, { min: rn, max: rn })
    }
  }

  // unikalne piętra (posortowane numerycznie, a potem alfabetycznie)
  const floors = Array.from(floorSet).sort((a, b) => {
    const na = Number(a), nb = Number(b)
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
    return String(a).localeCompare(String(b), 'pl')
  })

  return (
    <div className="kiosk-container view-sanatorium-pokoje">
      <TopBar />
      <ViewHeading title="Pokoje — wybierz piętro" color="orange" />

      <section className="content-container">
        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}

        {!loading && !error && floors.length === 0 && (
          <p>Brak zdefiniowanych pięter w danych.</p>
        )}

        {!loading && !error && floors.length > 0 && (
          <div className="rooms-floor-grid">
            <h3>Wybierz piętro:</h3>
            {floors.map((floor) => {
              const range = rangeByFloor.get(String(floor))
              const rangeText = range
                ? `${range.min}–${range.max}`
                : `${floor}00 – ${floor}XX`

              return (
                <Link
                  key={floor as React.Key}
                  className="kiosk-btn kiosk-btn--outline"
                  to={`/sanatorium-pokoje/${encodeURIComponent(String(floor))}`}
                >
                  Piętro {String(floor)} – pokoje {rangeText}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <BottomBackBar
        secondsLeft={seconds}
        backTo={`/sanatorium`}
      />
    </div>
  )
}
