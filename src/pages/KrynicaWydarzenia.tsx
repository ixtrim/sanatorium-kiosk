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
  date?: string
  dateLabel?: string
  title?: string
  summary?: string
  [key: string]: any
}

function todayStartLocalMs() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function isHeaderRow(ev: any): boolean {
  const s = String(ev?.date ?? ev?.Date ?? ev?.A ?? '').trim().toLowerCase()
  return s === 'date'
}

function getEventDayStartMs(ev: any): number | null {
  const raw = ev?.date ?? ev?.dateISO ?? ev?.startDate ?? ev?.start
  if (!raw) return null

  const s = String(raw).trim()
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null

  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/**
 * Wyciąga pierwszy URL z tekstu (kolumna C / summary),
 * usuwa go z tekstu (żeby nie wyświetlać w opisie).
 */
function extractUrlFromText(text: string): { cleanedText: string; url: string | null } {
  const raw = String(text ?? '')

  // znajdź pierwszy URL
  const match = raw.match(/https?:\/\/[^\s<>"')\]]+/i)
  if (!match) {
    return { cleanedText: raw.trim(), url: null }
  }

  // usuń ewentualną kropkę/przecinek na końcu
  let url = match[0].trim().replace(/[.,;]+$/, '')

  // usuń URL z tekstu (pierwsze wystąpienie)
  let cleaned = raw.replace(match[0], '').trim()

  // posprzątaj puste linie (po wycięciu URL)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()

  return { cleanedText: cleaned, url }
}

export default function KrynicaWydarzenia() {
  const seconds = useIdleSecondsLeft(60_000)
  const { events, loading, error } = useUpcomingEventsCsv(FILE_ID, GID)

  // ✅ tylko od dzisiaj w przód + sort od najbliższego
  const rows = useMemo(() => {
    const list = (events || []) as any[]
    const todayMs = todayStartLocalMs()

    return list
      .filter((ev) => !isHeaderRow(ev))
      .map((ev) => ({ ev: ev as EventRow, dayMs: getEventDayStartMs(ev) }))
      .filter(({ dayMs }) => dayMs == null || dayMs >= todayMs)
      .sort((a, b) => {
        if (a.dayMs == null && b.dayMs == null) return 0
        if (a.dayMs == null) return 1
        if (b.dayMs == null) return -1
        return a.dayMs - b.dayMs
      })
      .map(({ ev }) => ev)
  }, [events])

  // pagination
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    setIdx(0)
  }, [rows.length])

  const canPrev = rows.length > 0 && idx > 0
  const canNext = rows.length > 0 && idx < rows.length - 1
  const current = rows.length > 0 ? rows[idx] : null

  // ✅ obrazek bierzemy z URL-a w kolumnie C (summary)
  const { cleanedText: summaryCleaned, url: imageFromSummary } = useMemo(() => {
    const s = current?.summary ?? ''
    return extractUrlFromText(s)
  }, [current?.summary])

  const [imgOk, setImgOk] = useState(true)
  useEffect(() => {
    setImgOk(true)
  }, [idx, imageFromSummary])

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
                  <div className="event-date">{current.dateLabel ?? current.date ?? ''}</div>

                  {current.title && <h3 className="event-title">{current.title}</h3>}

                  {imageFromSummary && imgOk && (
                    <figure className="row-image event-image-wrap">
                      <img
                        src={imageFromSummary}
                        alt={current.title ? String(current.title) : 'Wydarzenie'}
                        onError={() => setImgOk(false)}
                        loading="eager"
                        draggable={false}
                        referrerPolicy="no-referrer"
                      />
                    </figure>
                  )}

                  {summaryCleaned && (
                    <div className="event-description preline">
                      <TypewriterText
                        text={summaryCleaned}
                        className="view-content-text preline"
                        speedMs={18}
                        startDelayMs={80}
                      />
                    </div>
                  )}
                </li>
              </ul>

              <div className="row-nav">
                {/* prev pojawia się dopiero gdy użytkownik przeszedł dalej */}
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
