import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContentCsv } from '../hooks/useGSheetRandomContentCsv'
import TypewriterText from '../components/TypewriterText'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '1455303464'

// Limit: max 3 kliknięcia „Dalej” w oknie 5 minut
const LIMIT = 3
const WINDOW_MS = 5 * 60 * 1000
const STORAGE_KEY = 'porady:window_v2' // unikalny klucz dla tej sekcji

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

export default function CiekawostkiPorady() {
  const seconds = useIdleSecondsLeft(60_000)

  const { rows, loading, error } = useGSheetRandomContentCsv(FILE_ID, GID)

  // stan limitu
  const [winStart, setWinStart] = useState<number>(() => readWindow().start)
  const [viewed, setViewed] = useState<number>(() => readWindow().count)
  const reached = viewed >= LIMIT

  // indeks aktualnego wpisu
  const [idx, setIdx] = useState<number | null>(null)

  // losuj pierwszy wpis (pierwszy widok nie jest liczony)
  useEffect(() => {
    if (!loading && rows.length > 0 && idx === null && !reached) {
      setIdx(Math.floor(Math.random() * rows.length))
    }
  }, [loading, rows, idx, reached])

  // watchdog: reset okna po 5 min (sprawdzamy co 1 s)
  useEffect(() => {
    const t = setInterval(() => {
      const s = readWindow()
      if (s.start !== winStart || s.count !== viewed) {
        setWinStart(s.start)
        setViewed(s.count)
        // po resecie i braku indeksu — wylosuj nowy
        if (s.count === 0 && idx === null && rows.length > 0) {
          setIdx(Math.floor(Math.random() * rows.length))
        }
      }
    }, 1000)
    return () => clearInterval(t)
  }, [winStart, viewed, idx, rows.length])

  const item = idx !== null ? rows[idx] : null

  // klik „Dalej”: nalicz w oknie i losuj inny wpis
  const reload = () => {
    const s = readWindow()
    if (s.count >= LIMIT) return
    if (rows.length <= 1) return

    // wybierz inny indeks niż obecny
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
      // po limicie chowamy treść
      setIdx(null)
    }
  }

  return (
    <div className="kiosk-container">
      <TopBar />
      <div className="view-ciekawostki-porady">
        <ViewHeading title="Porady" color="green" />

        <section className="content-container">
          <div className="view-content">
            {loading && <p>Ładowanie…</p>}
            {error && <p>Błąd: {error}</p>}

            {/* osiągnięto limit w oknie 5 min */}
            {!loading && !error && reached && (
              <div className="thats-all-today">
                To wszystko na teraz. Wróć jutro po nowe treści.
              </div>
            )}

            {/* brak treści (i nie osiągnięto limitu) */}
            {!loading && !error && !reached && !item && (
              <p>Brak treści do wyświetlenia.</p>
            )}

            {/* treść tylko gdy nie osiągnięto limitu */}
            {!loading && !error && !reached && item && (
              <article key={`${idx ?? 0}-${viewed}`}>
                {item.title && <h2 className="view-content-title">{item.title}</h2>}
                <TypewriterText
                  text={item.content ?? ''}
                  className="view-content-text preline"
                  speedMs={18}
                  startDelayMs={80}
                />
              </article>
            )}
          </div>

          {/* przycisk znika po osiągnięciu limitu */}
          {!reached && (
            <div className="view-content-actions">
              <button
                className="kiosk-btn kiosk-btn--outline"
                onClick={reload}
                disabled={rows.length <= 1}
              >
                Dalej
              </button>
            </div>
          )}
        </section>
      </div>
      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
