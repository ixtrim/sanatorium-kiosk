import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContentCsv } from '../hooks/useGSheetRandomContentCsv'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '1032664144'

// Limit: max 3 kliknięcia „Dalej” w oknie 5 minut
const LIMIT = 3
const WINDOW_MS = 5 * 60 * 1000
const STORAGE_KEY = 'savoir-vivre:window_v2'

type WinState = { start: number; count: number }

function nowMs() { return Date.now() }
function isExpired(now: number, start: number) { return now - start >= WINDOW_MS }

function readWindow(): WinState {
  const now = nowMs()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const obj = JSON.parse(raw)
      const start = Number.isFinite(obj?.start) ? obj.start : now
      const count = Number.isFinite(obj?.count) ? obj.count : 0
      if (isExpired(now, start)) {
        const fresh = { start: now, count: 0 }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
        return fresh
      }
      return { start, count }
    }
  } catch {}
  const fresh = { start: now, count: 0 }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  return fresh
}

function writeWindow(s: WinState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export default function CiekawostkiSavoirVivre() {
  const seconds = useIdleSecondsLeft(60_000)

  const { rows, loading, error } = useGSheetRandomContentCsv(FILE_ID, GID)
        
  const [idx, setIdx] = useState<number | null>(null)

  // stan limitu
  const [winStart, setWinStart] = useState<number>(() => readWindow().start)
  const [viewed, setViewed] = useState<number>(() => readWindow().count)
  const reached = viewed >= LIMIT
  
  useEffect(() => {
    if (!loading && rows.length > 0 && idx === null && !reached) {
      setIdx(Math.floor(Math.random() * rows.length))
    }
  }, [loading, rows, idx, reached])

  // watchdog resetu 5-min okna
  useEffect(() => {
    const t = setInterval(() => {
      const s = readWindow()
      if (s.start !== winStart || s.count !== viewed) {
        setWinStart(s.start)
        setViewed(s.count)
        if (s.count === 0 && idx === null && rows.length > 0) {
          setIdx(Math.floor(Math.random() * rows.length))
        }
      }
    }, 1000)
    return () => clearInterval(t)
  }, [winStart, viewed, idx, rows.length])

  const item = idx !== null ? rows[idx] : null

  const reload = () => {
    const s = readWindow()
    if (s.count >= LIMIT) return
    if (rows.length <= 1) return
    let n = idx
    while (rows.length > 1 && n === idx) {
      n = Math.floor(Math.random() * rows.length)
    }
    setIdx(n as number)
    const next = Math.min(s.count + 1, LIMIT)
    const updated: WinState = { start: s.start, count: next }
    writeWindow(updated)
    setWinStart(updated.start)
    setViewed(updated.count)
    if (next >= LIMIT) {
      setIdx(null)
    }
  }

  return (
    <div className="kiosk-container">
      <TopBar />
      <div className="view-ciekawostki-savoir-vivre">
        <ViewHeading title="Savoir Vivre" color="green" />

        <section className="content-container">

          <div className="view-content">
            {loading && <p>Ładowanie…</p>}
            {error && <p>Błąd: {error}</p>}
            {!loading && !error && reached && (
              <div className="thats-all-today">
                To wszystko na teraz. Wróć jutro po nowe treści.
              </div>
            )}
            {!loading && !error && !reached && !item && <p>Brak treści do wyświetlenia.</p>}

            {!loading && !error && !reached && item && (
              <article>
                {item.title && <h2 className="view-content-title">{item.title}</h2>}
                <p className="view-content-text preline">{item.content}</p>
              </article>
            )}
          </div>

          <div className="view-content-actions">
            {!reached && (
              <button
                className="kiosk-btn kiosk-btn--outline"
                onClick={reload}
                disabled={rows.length <= 1}
              >
                Dalej
              </button>
            )}
          </div>

        </section>
        
      </div>
      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
