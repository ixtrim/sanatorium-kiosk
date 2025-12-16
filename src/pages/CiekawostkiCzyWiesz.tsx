import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContentCsv } from '../hooks/useGSheetRandomContentCsv'
import TypewriterText from '../components/TypewriterText'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '1240753996'

const LIMIT = 3
const WINDOW_MS = 5 * 60 * 1000 // 5 minut

type WinState = { start: number; count: number }

export default function CiekawostkiCzyWiesz() {
  const seconds = useIdleSecondsLeft(60_000)
  const { rows, loading, error } = useGSheetRandomContentCsv(FILE_ID, GID)

  // Stały klucz dla 5-minutowego okna
  const storageKey = useMemo(() => 'czy-wiesz:window_v1', [])

  const [viewed, setViewed] = useState<number>(0)
  const [winStart, setWinStart] = useState<number>(Date.now())
  const [idx, setIdx] = useState<number | null>(null)
  const [countedInitial, setCountedInitial] = useState(false)

  const nowMs = () => Date.now()
  const isExpired = (now: number, start: number) => now - start >= WINDOW_MS

  // Odczyt + ewentualny reset okna w localStorage (zwraca spójny stan)
  const syncFromStorage = (): WinState => {
    const now = nowMs()
    let start = now
    let count = 0
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const obj = JSON.parse(raw)
        if (Number.isFinite(obj?.start)) start = obj.start
        if (Number.isFinite(obj?.count)) count = obj.count
      } catch { /* ignore */ }
    }
    if (isExpired(now, start)) {
      start = now; count = 0
    }
    const state: WinState = { start, count }
    localStorage.setItem(storageKey, JSON.stringify(state))
    setWinStart(start)
    setViewed(count)
    return state
  }

  // Inicjalizacja okna
  useEffect(() => {
    syncFromStorage()
    // cyklicznie sprawdzaj wygaśnięcie okna, aby odblokować widok po 5 min
    const t = setInterval(() => {
      const now = nowMs()
      // pobierz aktualny start z LS
      let start = winStart
      try {
        const obj = JSON.parse(localStorage.getItem(storageKey) || '{}')
        if (Number.isFinite(obj?.start)) start = obj.start
      } catch { /* ignore */ }
      if (isExpired(now, start)) {
        const refreshed: WinState = { start: now, count: 0 }
        localStorage.setItem(storageKey, JSON.stringify(refreshed))
        setWinStart(now)
        setViewed(0)
        setCountedInitial(false)
        setIdx(null) // wyczyść, za chwilę losujemy nowy
      }
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  const reached = viewed >= LIMIT

  // Start: losuj wpis, jeśli nie osiągnięto limitu
  useEffect(() => {
    if (!loading && rows.length > 0 && idx === null && !reached) {
      setIdx(Math.floor(Math.random() * rows.length))
    }
  }, [loading, rows, idx, reached])

  const item = idx !== null ? rows[idx] : null

  // Pierwsze wyświetlenie liczymy jako 1 z 3 (w obrębie okna 5 min)
  useEffect(() => {
    if (!countedInitial && item && !reached) {
      const st = syncFromStorage()
      const next = Math.min(st.count + 1, LIMIT)
      const updated: WinState = { start: st.start, count: next }
      localStorage.setItem(storageKey, JSON.stringify(updated))
      setWinStart(st.start)
      setViewed(next)
      setCountedInitial(true)
      if (next >= LIMIT) {
        setIdx(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, reached])

  const reload = () => {
    const st = syncFromStorage()
    if (st.count >= LIMIT) return
    if (rows.length <= 1) return

    // wybierz inny indeks niż obecny
    let n = idx
    while (rows.length > 1 && n === idx) {
      n = Math.floor(Math.random() * rows.length)
    }
    setIdx(n as number)

    const next = Math.min(st.count + 1, LIMIT)
    const updated: WinState = { start: st.start, count: next }
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setWinStart(st.start)
    setViewed(next)

    if (next >= LIMIT) {
      // po ostatnim — chowamy treść
      setIdx(null)
    }
  }

  return (
    <div className="kiosk-container view-ciekawostki-czy-wiesz">
      <TopBar />
      <ViewHeading title="Czy wiesz że?" color="green" />

      <section className="content-container">
        <div className="view-content">
          {loading && <p>Ładowanie…</p>}
          {error && <p>Błąd: {error}</p>}

          {/* Limit okna 5 min osiągnięty */}
          {!loading && !error && reached && (
            <div className="thats-all-today">
              To wszystko na teraz. Wróć jutro po nowe treści.
            </div>
          )}

          {/* Brak treści i nie osiągnięto limitu */}
          {!loading && !error && !reached && !item && (
            <p>Brak treści do wyświetlenia.</p>
          )}

          {/* Treść (tylko jeśli nie osiągnięto limitu) */}
          {!loading && !error && !reached && item && (
            <article key={`${idx ?? 0}-${viewed}`}>
              {item.title && <h2 className="view-content-title">{item.title}</h2>}
              <TypewriterText
                text={item.content ?? ''}
                className="view-content-text"
                speedMs={18}
                startDelayMs={80}
              />
            </article>
          )}
        </div>

        {/* Przycisk ukryty po osiągnięciu limitu */}
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

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
