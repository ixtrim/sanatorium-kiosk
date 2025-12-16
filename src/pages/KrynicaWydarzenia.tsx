import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useUpcomingEventsCsv } from '../hooks/useUpcomingEventsCsv'
import TypewriterText from '../components/TypewriterText'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '0'

type EventRow = {
  title?: string
  summary?: string
  dateLabel?: string
  date?: string // czasem bywa ISO
  dateISO?: string
  start?: string
  startDate?: string
  imageUrl?: string
  [key: string]: any
}

function todayStartLocalMs() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function getEventDayStartMs(ev: any): number | null {
  if (!ev) return null

  // preferuj typowe pola (u Ciebie kol. A wygląda na ISO: 2025-12-17)
  const candidates = [
    ev.dateISO,
    ev.startDate,
    ev.start,
    ev.date,
    ev.Date,
    ev['A'],
    ev['Column A'],
  ].filter(Boolean)

  let raw: any = candidates[0]

  if (!raw && typeof ev === 'object') {
    const found = Object.values(ev).find((v) => typeof v === 'string' && /\d{4}-\d{2}-\d{2}/.test(v))
    raw = found
  }
  if (!raw) return null

  const s = String(raw).trim()

  // ISO: 2025-12-17 lub 2025-12-17T...
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    }
  }

  // MM/DD/YY... (gdyby kiedykolwiek było)
  const mdy = s.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  if (mdy) {
    const mm = Number(mdy[1])
    const dd = Number(mdy[2])
    let yy = Number(mdy[3])
    if (mdy[3].length === 2) yy = 2000 + yy
    const d = new Date(yy, mm - 1, dd)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }

  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  }

  return null
}

function getEventImageUrl(ev: any): string | null {
  if (!ev) return null

  // kolumna G (URL)
  const direct = [
    ev.imageUrl,
    ev.image,
    ev.img,
    ev.photo,
    ev.cover,
    ev.G,
    ev['Column G'],
    ev['column G'],
    ev['column_g'],
  ].find((v) => typeof v === 'string' && v.trim().length > 0)

  if (typeof direct === 'string') {
    const url = direct.trim()
    if (/^https?:\/\//i.test(url) || /^\/\//.test(url)) return url
  }

  // fallback: pierwszy string będący URL
  if (typeof ev === 'object') {
    const found = Object.values(ev).find(
      (v) => typeof v === 'string' && /^https?:\/\//i.test(v.trim())
    )
    if (typeof found === 'string') return found.trim()
  }

  return null
}

export default function KrynicaWydarzenia() {
  const seconds = useIdleSecondsLeft(60_000)
  const { events, loading, error } = useUpcomingEventsCsv(FILE_ID, GID)

  // ✅ filtr + sort: tylko od dzisiaj w przód, posortowane od najbliższego
  const rows = useMemo(() => {
    const list = (events || []) as EventRow[]
    const todayMs = todayStartLocalMs()

    const withDate = list
      .map((ev) => {
        const dayMs = getEventDayStartMs(ev)
        return { ev, dayMs }
      })
      .filter(({ dayMs }) => dayMs == null || dayMs >= todayMs)
      .sort((a, b) => {
        // null na koniec (gdyby coś nie miało daty)
        if (a.dayMs == null && b.dayMs == null) return 0
        if (a.dayMs == null) return 1
        if (b.dayMs == null) return -1
        return a.dayMs - b.dayMs
      })
      .map(({ ev }) => ev)

    return withDate
  }, [events])

  // pagination
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
  }, [rows.length])

  const canPrev = rows.length > 0 && idx > 0
  const canNext = rows.length > 0 && idx < rows.length - 1
  const current = rows.length > 0 ? rows[idx] : null

  const imageSrc = current ? getEventImageUrl(current) : null
  const [imgOk, setImgOk] = useState(true)
  useEffect(() => setImgOk(true), [imageSrc])

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
              {/* ✅ obrazek z kolumny G nad treścią */}
              {imageSrc && imgOk && (
                <div className="event-image-wrap">
                  <img
                    src={imageSrc}
                    alt={current.title ? String(current.title) : 'Wydarzenie'}
                    className="event-image"
                    onError={() => setImgOk(false)}
                    loading="eager"
                  />
                </div>
              )}

              <ul className="view-content-events-list">
                <li key={idx} className="event-item">
                  <div className="event-date">
                    {current.dateLabel ?? current.date ?? ''}
                  </div>

                  {current.title && <h3 className="event-title">{current.title}</h3>}

                  {current.summary && (
                    <p className="event-description preline">
                      <TypewriterText
                        text={current.summary ?? ''}
                        className="view-content-text preline"
                        speedMs={18}
                        startDelayMs={80}
                      />
                    </p>
                  )}
                </li>
              </ul>

              <div className="row-nav">
                {/* ✅ pojawia się dopiero po przejściu do kolejnego */}
                {idx > 0 ? (
                  <button
                    className="kiosk-btn kiosk-btn--outline"
                    onClick={() => canPrev && setIdx((i) => Math.max(0, i - 1))}
                    disabled={!canPrev}
                  >
                    Poprzednie wydarzenie
                  </button>
                ) : (
                  <div />
                )}

                <div className="row-counter">
                  {rows.length > 0 ? `${idx + 1} / ${rows.length}` : '0 / 0'}
                </div>

                <button
                  className="kiosk-btn kiosk-btn--outline"
                  onClick={() => canNext && setIdx((i) => Math.min(rows.length - 1, i + 1))}
                  disabled={!canNext}
                >
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
