import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContentCsv } from '../hooks/useGSheetRandomContentCsv'
import TypewriterText from '../components/TypewriterText'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '857824412'

// Flow: dziś (0) -> wczoraj (1) -> 2 dni temu (2) -> blokada (3) na 5 minut
const LIMIT = 99
const WINDOW_MS = 5 * 60 * 1000
const STORAGE_KEY = 'humor:window_v2'

type WinState = { start: number; count: number }

type SheetRow = {
  title?: string
  content?: string
  [key: string]: any
}

const DAY_MS = 24 * 60 * 60 * 1000
const DATE_RX =
  /^\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})\s*([AP]M))?\s*$/i

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

function todayDayKeyUTC(): number {
  const d = new Date()
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Parses "12/17/25 09:47AM" (czas opcjonalny).
 * Zwraca ms w UTC (do wybierania "najnowszego" wpisu z danego dnia).
 */
function parseSheetDateToMs(value: string): number | null {
  const s = (value || '').trim()
  const m = s.match(DATE_RX)
  if (!m) return null

  const month = Number(m[1])
  const day = Number(m[2])
  let year = Number(m[3])

  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null

  if (m[3].length === 2) year = 2000 + year

  // time (optional)
  let hh = m[4] ? Number(m[4]) : 0
  const mm = m[5] ? Number(m[5]) : 0
  const ap = m[6] ? String(m[6]).toUpperCase() : null

  if (ap) {
    // 12h -> 24h
    if (hh === 12) hh = ap === 'AM' ? 0 : 12
    else if (ap === 'PM') hh += 12
  }

  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null

  return Date.UTC(year, month - 1, day, hh, mm, 0, 0)
}

/**
 * DayKey (UTC) dla daty z arkusza — ignoruje czas.
 */
function parseSheetDateToDayKey(value: string): number | null {
  const ms = parseSheetDateToMs(value)
  if (ms == null) return null
  const d = new Date(ms)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/**
 * Wyciąga string z datą z wiersza:
 * - jeśli hook zwraca tablice: bierze [0]
 * - jeśli obiekt: próbuje typowych pól albo skanuje wartości i bierze pierwszą pasującą do DATE_RX
 */
function getRowDateStr(row: any): string | null {
  if (!row) return null

  if (Array.isArray(row)) {
    const v = row[0]
    if (typeof v === 'string') return v.trim()
    if (v != null) return String(v).trim()
    return null
  }

  if (typeof row === 'object') {
    const directCandidates = [
      row.date,
      row.Date,
      row.created,
      row.createdAt,
      row.timestamp,
      row.time,
      row.datetime,
      row['Column A'],
      row['A'],
    ]

    for (const c of directCandidates) {
      if (typeof c === 'string' && c.trim()) return c.trim()
    }

    const found = Object.values(row).find((v) => typeof v === 'string' && DATE_RX.test(v.trim()))
    if (typeof found === 'string') return found.trim()
  }

  if (typeof row === 'string') return row.trim()

  return null
}

export default function CiekawostkiHumor() {
  const seconds = useIdleSecondsLeft(60_000)
  const { rows, loading, error } = useGSheetRandomContentCsv(FILE_ID, GID)

  // limiter state
  const [win, setWin] = useState<WinState>(() => readWindow())
  const reached = win.count >= LIMIT

  // offset dni: 0=dzis, 1=wczoraj, 2=2 dni temu
  const offset = Math.min(win.count, 2)

  // Zbuduj mapę: dayKey -> "najświeższy" wpis z tego dnia (jeśli jest kilka)
  const dayItems = useMemo(() => {
    if (loading) return new Map<number, SheetRow & { __ms?: number }>()
    const all = (rows || []) as any[]
    const todayKey = todayDayKeyUTC()
    const allowed = new Set<number>([todayKey, todayKey - DAY_MS, todayKey - 2 * DAY_MS])

    const map = new Map<number, SheetRow & { __ms?: number }>()
    for (const r of all) {
      const ds = getRowDateStr(r)
      if (!ds) continue

      const dayKey = parseSheetDateToDayKey(ds)
      if (dayKey == null) continue
      if (!allowed.has(dayKey)) continue

      const ms = parseSheetDateToMs(ds) ?? dayKey
      const prev = map.get(dayKey)
      if (!prev || (prev.__ms ?? 0) < ms) {
        map.set(dayKey, { ...(r as SheetRow), __ms: ms })
      }
    }

    return map
  }, [rows, loading])

  const todayKey = todayDayKeyUTC()
  const activeDayKey = todayKey - offset * DAY_MS
  const item = dayItems.get(activeDayKey) ?? null

  // watchdog: po 5 minutach reset -> pokaż znowu dzisiaj
  useEffect(() => {
    const t = setInterval(() => {
      const s = readWindow()
      if (s.start !== win.start || s.count !== win.count) {
        setWin(s)
      }
    }, 1000)

    return () => clearInterval(t)
  }, [win.start, win.count])

  const next = () => {
    const s = readWindow()
    if (s.count >= LIMIT) return

    const nextCount = Math.min(s.count + 1, LIMIT)
    const updated: WinState = { start: s.start, count: nextCount }
    writeWindow(updated)
    setWin(updated)
  }

  return (
    <div className="kiosk-container view-ciekawostki-humor">
      <TopBar />
      <ViewHeading title="Humor" color="green" />

      <section className="content-container">
        <div className="view-content">
          {loading && <p>Ładowanie…</p>}
          {error && <p>Błąd: {error}</p>}

          {!loading && !error && reached && (
            <div className="thats-all-today">To wszystko na teraz. Wróć jutro po nowe treści.</div>
          )}

          {!loading && !error && !reached && !item && (
            <p>Brak treści do wyświetlenia.</p>
          )}

          {!loading && !error && !reached && item && (
            <article key={String(activeDayKey)}>
              {item.title && <h2 className="view-content-title">{item.title}</h2>}
              <TypewriterText text={String(item.content ?? '')} className="view-content-text" />
            </article>
          )}
        </div>

        <div className="view-content-actions">
          {!reached && (
            <button className="kiosk-btn kiosk-btn--outline" onClick={next}>
              Dalej
            </button>
          )}
        </div>
      </section>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
