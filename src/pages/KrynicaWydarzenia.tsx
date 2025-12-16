import { useEffect, useState } from 'react'
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

  // pagination
  const [idx, setIdx] = useState(0)
  const rows = events // aby pasowało do podanego snippet-u
  useEffect(() => {
    // po zmianie listy zaczynamy od pierwszego
    setIdx(0)
  }, [rows.length])

  const canPrev = rows.length > 0 && idx > 0
  const canNext = rows.length > 0 && idx < rows.length - 1

  const current = rows.length > 0 ? rows[idx] : null

  return (
    <div className="kiosk-container view-krynica-wydarzenia">
      <TopBar />
      <ViewHeading title="Najbliższe wydarzenia" color="blue" />

      <section className="content-container">

        <div className="view-content">
          {loading && <p>Ładowanie…</p>}
          {error && <p>Błąd: {error}</p>}

          {!loading && !error && rows.length === 0 && (
            <p>Brak nadchodzących wydarzeń.</p>
          )}

          {!loading && !error && rows.length > 0 && current && (
            <>
              <ul className="view-content-events-list">
                <li key={idx} className="event-item">
                  <div className="event-date">{current.dateLabel}</div>
                  {current.title && <h3 className="event-title">{current.title}</h3>}
                  {current.summary && <p className="event-description preline">{current.summary}</p>}
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

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
