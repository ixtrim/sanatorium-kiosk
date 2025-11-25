import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useKalendariumToday } from '../hooks/useKalendariumToday'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '747899636' // Kalendarium tab

function todayLabelPl() {
  const now = new Date()
  const day = new Intl.DateTimeFormat('pl-PL', { day: '2-digit', timeZone: 'Europe/Warsaw' }).format(now)
  const month = new Intl.DateTimeFormat('pl-PL', { month: 'long', timeZone: 'Europe/Warsaw' }).format(now)
  return `${day} ${month}`
}

export default function CiekawostkiKalendarium() {
  const seconds = useIdleSecondsLeft(60_000)
  const { events, loading, error } = useKalendariumToday(FILE_ID, GID)

  return (
    <div className="kiosk-container">
      <TopBar />
      <div className="view-ciekawostki-kalendarium">
        <ViewHeading title="Kalendarium" color="green" />

        <div className="view-content">
          {loading && <p>Ładowanie…</p>}
          {error && <p>Błąd: {error}</p>}

          {!loading && !error && events.length === 0 && (
            <p>Brak wydarzeń dla dzisiejszej daty.</p>
          )}
          <h2 className="view-content-title">{todayLabelPl()}</h2>
          {!loading && !error && events.length > 0 && (
            
            <ul className="view-content-calendarium-list">
              {events.map((e, i) => (
                <li key={i} className="calendarium-list-item">
                  {e.year ? <div className="event-date">{todayLabelPl()} {e.year}</div> : null}
                  <div className="event-text preline">{e.content}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
