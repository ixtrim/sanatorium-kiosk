import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'

export type UpcomingEvent = {
  ymd: number
  dateLabel: string
  title: string
  summary: string
}

function clean(s?: string) {
  return (s ?? '').replace(/\r\n/g, '\n').trim()
}

function parseYMD(s?: string): { y: number; m: number; d: number } | null {
  if (!s) return null
  const t = s.trim()

  let m1 = t.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m1) return { y: +m1[1], m: +m1[2], d: +m1[3] }

  m1 = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (m1) return { y: +m1[3], m: +m1[2], d: +m1[1] }

  m1 = t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (m1) return { y: +m1[3], m: +m1[2], d: +m1[1] }

  m1 = t.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (m1) return { y: +m1[1], m: +m1[2], d: +m1[3] }

  return null
}

function todayYMD_Warsaw() {
  const now = new Date()
  const y = +new Intl.DateTimeFormat('pl-PL', { year: 'numeric',   timeZone: 'Europe/Warsaw' }).format(now)
  const m = +new Intl.DateTimeFormat('pl-PL', { month: '2-digit',  timeZone: 'Europe/Warsaw' }).format(now)
  const d = +new Intl.DateTimeFormat('pl-PL', { day: '2-digit',    timeZone: 'Europe/Warsaw' }).format(now)
  return y * 10000 + m * 100 + d
}

function formatDateLabel(y: number, m: number, d: number) {
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'long', year: 'numeric' })
}

export function useUpcomingEventsCsv(fileId: string, gid: string) {
  const [rows, setRows] = useState<UpcomingEvent[]>([])
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

        const today = todayYMD_Warsaw()
        const tmp: UpcomingEvent[] = []

        for (const r of parsed.data || []) {
          const ymdParts = parseYMD(r.date ?? r['Date'])
          if (!ymdParts) continue

          const ymd = ymdParts.y * 10000 + ymdParts.m * 100 + ymdParts.d
          if (ymd < today) continue

          const title = clean(r.title ?? r['Title'])
          const summary = clean(r.summary ?? r['Summary'] ?? r['opis'])

          tmp.push({
            ymd,
            title,
            summary,
            dateLabel: formatDateLabel(ymdParts.y, ymdParts.m, ymdParts.d),
          })
        }

        tmp.sort((a, b) => a.ymd - b.ymd)
        if (!cancelled) setRows(tmp)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Fetch error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [fileId, gid])
  
  const events = useMemo(() => rows, [rows])

  return { events, loading, error }
}
