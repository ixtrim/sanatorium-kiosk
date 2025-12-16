import { useEffect, useState } from 'react'
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

  // Pagination (jeden event na ekranie)
  const [idx, setIdx] = useState(0)
  const rows = events
  useEffect(() => {
    setIdx(0)
  }, [rows.length])

  const canPrev = rows.length > 0 && idx > 0
  const canNext = rows.length > 0 && idx < rows.length - 1
  const current = rows.length > 0 ? rows[idx] : null

  return (
    <div className="kiosk-container">
      <TopBar />
      <div className="view-ciekawostki-kalendarium">
        <ViewHeading title="Kalendarium" color="green" />

        <section className="content-container">

        <div className="view-content">
          {loading && <p>Ładowanie…</p>}
          {error && <p>Błąd: {error}</p>}

          {!loading && !error && events.length === 0 && (
            <p>Brak wydarzeń dla dzisiejszej daty.</p>
          )}

          <h2 className="view-content-title">{todayLabelPl()}</h2>

          {!loading && !error && rows.length > 0 && current && (
            <>
              <ul className="view-content-calendarium-list">
                <li key={idx} className="calendarium-list-item">
                  {current.year ? <div className="event-date">{todayLabelPl()} {current.year}</div> : null}
                  <div className="event-text preline">{current.content}</div>
                </li>
              </ul>

              <div className="row-nav">
                <button className="kiosk-btn kiosk-btn--outline" onClick={() => canPrev && setIdx(i => Math.max(0, i - 1))} disabled={!canPrev} >
                  Poprzednie wydarzenie
                </button>

                <div className="row-counter">
                  {rows.length > 0 ? `${idx + 1} / ${rows.length}` : '0 / 0'}
                </div>

                <button className="kiosk-btn kiosk-btn--outline" onClick={() => canNext && setIdx(i => Math.min(rows.length - 1, i + 1))}
                  disabled={!canNext} >
                  Następne wydarzenie
                </button>
              </div>
            </>
          )}
        </div>

        </section>

      </div>
      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
