import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContentCsv } from '../hooks/useGSheetRandomContentCsv'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '857824412'

export default function CiekawostkiHumor() {
  const seconds = useIdleSecondsLeft(60_000)

  const { rows, loading, error } = useGSheetRandomContentCsv(FILE_ID, GID)
    
  const [idx, setIdx] = useState<number | null>(null)
  
  useEffect(() => {
    if (!loading && rows.length > 0 && idx === null) {
      setIdx(Math.floor(Math.random() * rows.length))
    }
  }, [loading, rows, idx])

  const item = idx !== null ? rows[idx] : null

  const reload = () => {
    if (rows.length <= 1) return
    let n = idx
    while (rows.length > 1 && n === idx) {
      n = Math.floor(Math.random() * rows.length)
    }
    setIdx(n as number)
  }

  return (
    <div className="kiosk-container view-ciekawostki-humor">
      <TopBar />
      <ViewHeading title="Humor" color="green" />

      <div className="view-content">
        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}
        {!loading && !error && !item && <p>Brak treści do wyświetlenia.</p>}

        {!loading && !error && item && (
          <article>
            {item.title && <h2 className="view-content-title">{item.title}</h2>}
            <p className="view-content-text preline">{item.content}</p>
          </article>
        )}
      </div>

      <div className="view-content-actions">
        <button
          className="kiosk-btn kiosk-btn--outline"
          onClick={reload}
          disabled={rows.length <= 1}
        >
          Przeładuj
        </button>
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
