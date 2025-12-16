import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContent } from '../hooks/useGSheetRandomContent'
import AnimatedText from '../components/AnimatedText'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '492714709'

// Limit: max 3 kliknięcia „Dalej” w oknie 5 minut
const LIMIT = 3
const WINDOW_MS = 5 * 60 * 1000
const STORAGE_KEY = 'kuracjusze:window_v2'

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

export default function SanatoriumKuracjusze() {
  const seconds = useIdleSecondsLeft(60_000)

  const { loading, error, first, pickRandom } =
    useGSheetRandomContent(FILE_ID, GID, { category: 'nasi_kuracjusze' })

  const [item, setItem] = useState(first)
  const [rev, setRev] = useState(0) // forces remount -> animation always restarts

  // stan limitu
  const [winStart, setWinStart] = useState<number>(() => readWindow().start)
  const [viewed, setViewed] = useState<number>(() => readWindow().count)
  const reached = viewed >= LIMIT

  if (!item && first) setItem(first)

  // watchdog resetu 5-min okna
  useEffect(() => {
    const t = setInterval(() => {
      const s = readWindow()
      if (s.start !== winStart || s.count !== viewed) {
        setWinStart(s.start)
        setViewed(s.count)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [winStart, viewed])

  const goNext = () => {
    const s = readWindow()
    if (s.count >= LIMIT) return
    const next = pickRandom()
    if (next) {
      setItem(next)
      setRev((r) => r + 1)
      const updated: WinState = { start: s.start, count: Math.min(s.count + 1, LIMIT) }
      writeWindow(updated)
      setWinStart(updated.start)
      setViewed(updated.count)
    }
  }

  return (
    <div className="kiosk-container view-sanatorium-kuracjusze">
      <TopBar />
      <ViewHeading title="Kuracjusze" color="orange" />

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
          <article key={rev}>
            {item.title && <h2 className="view-content-title">{item.title}</h2>}
            <AnimatedText text={item.content ?? ''} className="view-content-text" />
          </article>
        )}
      </div>

      <div className="view-content-actions">
        {!reached && (
          <button className="kiosk-btn kiosk-btn--outline" onClick={goNext}>
            Dalej
          </button>
        )}
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
