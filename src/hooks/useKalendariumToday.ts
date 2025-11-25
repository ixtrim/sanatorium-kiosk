import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'

export type KalEvent = {
  event_date?: string // from col C, e.g. "24-11-1987" / "24.11.1987"
  content?: string    // from col D
  source?: string     // from col E (optional)
  year?: number | null
}

function parseDayMonthYear(s?: string) {
  if (!s) return null
  // Accept "24-11-1987", "24.11.1987", "24/11/1987", also without year
  const m = s.trim().match(/^(\d{1,2})[.\-/](\d{1,2})(?:[.\-/](\d{2,4}))?$/)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const yRaw = m[3]
  const year = yRaw ? Number(yRaw.length === 2 ? '19' + yRaw : yRaw) : null
  if (!day || !month) return null
  return { day, month, year }
}

function getTodayDM_Warsaw() {
  const now = new Date()
  const day = Number(new Intl.DateTimeFormat('pl-PL', { day: '2-digit', timeZone: 'Europe/Warsaw' }).format(now))
  const month = Number(new Intl.DateTimeFormat('pl-PL', { month: '2-digit', timeZone: 'Europe/Warsaw' }).format(now))
  return { day, month }
}

/** Read Kalendarium tab via CSV and return events where event_date has same day+month as today. */
export function useKalendariumToday(fileId: string, gid: string) {
  const [rows, setRows] = useState<KalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv&gid=${gid}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()

        const parsed = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: 'greedy',
        })

        const data: KalEvent[] = (parsed.data || []).map((r) => {
          const ed = (r.event_date || r['event_date'] || '').trim()
          const p = parseDayMonthYear(ed)
          return {
            event_date: ed,
            content: r.content ?? '',
            source: r.source?.trim(),
            year: p?.year ?? null,
          }
        })
        if (!cancelled) setRows(data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Fetch error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [fileId, gid])

  // Filter for today's day & month in Warsaw tz, with non-empty content
  const todayList = useMemo(() => {
    const { day: td, month: tm } = getTodayDM_Warsaw()
    return rows
      .filter(r => {
        if (!r.content?.trim()) return false
        const p = parseDayMonthYear(r.event_date)
        return p?.day === td && p?.month === tm
      })
      .sort((a, b) => (a.year ?? 0) - (b.year ?? 0)) // oldest → newest (change sign for newest first)
  }, [rows])

  return { events: todayList, loading, error }
}
