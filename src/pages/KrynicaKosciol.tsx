import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContentCsv } from '../hooks/useGSheetRandomContentCsv'
import TypewriterText from '../components/TypewriterText'

const FILE_ID = '1iIoeZYMJ6K0tGunOtGphW-Ud5K1S_d0VJO2ozB7YW7E'
const GID = '1156143261'

// (optional) limiter: max 33 "Dalej" in 5 minutes
const LIMIT = 33
const WINDOW_MS = 5 * 60 * 1000
const STORAGE_KEY = 'krynica-kosciol:window_v2'

type WinState = { start: number; count: number }

function nowMs() {
  return Date.now()
}
function isExpired(now: number, start: number) {
  return now - start >= WINDOW_MS
}

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

export default function KrynicaKosciol() {
  const seconds = useIdleSecondsLeft(60_000)
  const { rows, loading, error } = useGSheetRandomContentCsv(FILE_ID, GID)

  // ✅ show from 2nd row (index 1) till end
  const visibleRows = useMemo(() => (Array.isArray(rows) ? rows.slice(1) : []), [rows])

  // navigation index (0 = sheet row #2)
  const [idx, setIdx] = useState(0)

  // limiter window state
  const [winStart, setWinStart] = useState<number>(() => readWindow().start)
  const [viewed, setViewed] = useState<number>(() => readWindow().count)
  const reached = viewed >= LIMIT

  // keep idx valid when data loads/changes
  useEffect(() => {
    if (loading) return
    if (visibleRows.length === 0) {
      setIdx(0)
      return
    }
    setIdx((i) => Math.min(Math.max(0, i), visibleRows.length - 1))
  }, [loading, visibleRows.length])

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

  const item = visibleRows.length > 0 ? visibleRows[idx] : null

  const canPrev = !reached && idx > 0
  const canNext = !reached && idx < visibleRows.length - 1

  const goPrev = () => {
    if (!canPrev) return
    setIdx((i) => Math.max(0, i - 1))
  }

  const goNext = () => {
    if (!canNext) return

    // count only "Dalej" clicks for limiter
    const s = readWindow()
    const next = Math.min(s.count + 1, LIMIT)
    const updated: WinState = { start: s.start, count: next }
    writeWindow(updated)
    setWinStart(updated.start)
    setViewed(updated.count)

    setIdx((i) => Math.min(visibleRows.length - 1, i + 1))
  }

  return (
    <div className="kiosk-container">
      <TopBar />
      <div className="view-krynica-kosciol">
        <ViewHeading title="Kościół" color="blue" />

        <section className="content-container-pdf-short">
          <div className="view-content">
            {loading && <p>Ładowanie…</p>}
            {error && <p>Błąd: {error}</p>}

            {!loading && !error && reached && (
              <div className="thats-all-today">To wszystko na teraz. Wróć jutro po nowe treści.</div>
            )}

            {!loading && !error && !reached && visibleRows.length === 0 && (
              <p>Brak treści do wyświetlenia.</p>
            )}

            {!loading && !error && !reached && item && (
              <article key={idx}>
                {item.title && <h2 className="view-content-title">{item.title}</h2>}
                <TypewriterText text={item.content} className="view-content-text preline" />
              </article>
            )}

            {!loading && !error && visibleRows.length > 0 && (
            <div className="row-nav">
              <button
                className="kiosk-btn kiosk-btn--outline"
                onClick={goPrev}
                disabled={!canPrev}
              >
                Wstecz
              </button>

              <div className="row-counter">
                {visibleRows.length > 0 ? `${idx + 1} / ${visibleRows.length}` : '0 / 0'}
              </div>

              <button
                className="kiosk-btn kiosk-btn--outline"
                onClick={goNext}
                disabled={!canNext}
              >
                Dalej
              </button>
            </div>
          )}
          </div>

          
        </section>
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
