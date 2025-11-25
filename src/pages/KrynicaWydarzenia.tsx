import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useUpcomingEventsCsv } from '../hooks/useUpcomingEventsCsv'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '0'

export default function KrynicaWydarzenia() {
  const seconds = useIdleSecondsLeft(60_000)
  const { events, loading, error } = useUpcomingEventsCsv(FILE_ID, GID)

  return (
    <div className="kiosk-container view-krynica-wydarzenia">
      <TopBar />
      <ViewHeading title="Najbliższe wydarzenia" color="blue" />

      <div className="view-content">
        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}
        {!loading && !error && events.length === 0 && (
          <p>Brak nadchodzących wydarzeń.</p>
        )}

        {!loading && !error && events.length > 0 && (
          <ul className="view-content-events-list">
            {events.map((ev, i) => (
              <li key={i} className="event-item">
                <div className="event-date">{ev.dateLabel}</div>
                {ev.title && <h3 className="event-title">{ev.title}</h3>}
                {ev.summary && <p className="event-description preline">{ev.summary}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
