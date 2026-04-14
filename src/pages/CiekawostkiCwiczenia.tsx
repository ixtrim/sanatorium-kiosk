import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContentCsv } from '../hooks/useGSheetRandomContentCsv'
import TypewriterText from '../components/TypewriterText'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '528357383'

// Limit: max 99 kliknięć „Dalej” w oknie 5 minut (nieużywane w nowej logice cyklicznej)
const LIMIT = 99
const WINDOW_MS = 5 * 60 * 1000
const STORAGE_KEY = 'cwiczenia:window_v2' // zmieniony suffix, by wyczyścić stary stan

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

export default function CiekawostkiCwiczenia() {
  const seconds = useIdleSecondsLeft(60_000)
  const { rows, loading, error } = useGSheetRandomContentCsv(FILE_ID, GID)

  // stan okna limitu (odczytany z localStorage)
  const [winStart, setWinStart] = useState<number>(() => readWindow().start)
  const [viewed, setViewed] = useState<number>(() => readWindow().count)
  const reached = viewed >= LIMIT

  // Indeks wyświetlanego wpisu (cyklicznie 0,1,2)
  const [idx, setIdx] = useState<number>(0)

  // Wyznacz 3 najnowsze wpisy (ostatnie w tablicy)
  const lastThree = rows.slice(-3)
  const item = lastThree.length > 0 ? lastThree[idx % lastThree.length] : null

  // watchdog resetu 5-min okna (co 1s) - nie zmienia idx, tylko licznik viewed
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

  // klik „Dalej” = przejdź do kolejnego wpisu z 3 ostatnich, cyklicznie
  const reload = () => {
    if (lastThree.length === 0) return
    setIdx((prev) => (prev + 1) % lastThree.length)
  }

  return (
    <div className="kiosk-container">
      <TopBar />

      <div className="view-ciekawostki-czy-wiesz">
        <ViewHeading title="Ćwiczenia" color="green" />

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

            {/* brak treści i nie osiągnięto limitu */}
            {!loading && !error && !reached && !item && (
              <p>Brak treści do wyświetlenia.</p>
            )}

            {/* treść tylko jeśli nie osiągnięto limitu */}
            {!loading && !error && !reached && item && (
              <article key={`${idx}-${viewed}`}>
                {item.title && <h2 className="view-content-title">{item.title}</h2>}
                <TypewriterText text={item.content} className="view-content-text" />
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
