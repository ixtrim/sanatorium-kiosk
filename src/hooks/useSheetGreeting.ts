import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'

type Row = { greeting_text?: string | null }

type Options = {
  /** refetch interval; default 1h */
  refreshMs?: number
  /** storage key suffix (useful if you have multiple sheets) */
  cacheKey?: string
}

/** Reads a public Google Sheet (CSV export) and returns a random greeting_text */
export function useSheetGreeting(sheetId: string, gid: string, opts: Options = {}) {
  const { refreshMs = 60 * 60 * 1000, cacheKey = `${sheetId}:${gid}` } = opts
  const [rows, setRows] = useState<Row[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // try local cache first (for offline)
  useEffect(() => {
    const cached = localStorage.getItem(`quotes:${cacheKey}`)
    if (cached) {
      try { setRows(JSON.parse(cached)) } catch {}
    }
  }, [cacheKey])

  useEffect(() => {
    let aborted = false

    async function load() {
      setLoading(true)
      setError(null)

      // CSV export endpoint; works if the sheet is "Anyone with the link – Viewer"
      // If you hit CORS in dev, see vite proxy note below.
      const directUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`

      try {
        const res = await fetch(directUrl, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()

        const parsed = Papa.parse<Row>(text, { header: true, skipEmptyLines: 'greedy' })
        const clean = (parsed.data || [])
          .map(r => ({ greeting_text: (r as any).greeting_text as string | undefined }))
          .filter(r => r.greeting_text && r.greeting_text.trim().length > 0)

        if (!aborted) {
          setRows(clean)
          localStorage.setItem(`quotes:${cacheKey}`, JSON.stringify(clean))
        }
      } catch (e: any) {
        if (!aborted) setError(e?.message || 'fetch_error')
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, refreshMs)
    return () => { aborted = true; clearInterval(id) }
  }, [sheetId, gid, refreshMs, cacheKey])

  // pick random greeting
  const greeting = useMemo(() => {
    if (!rows || rows.length === 0) return null
    const i = Math.floor(Math.random() * rows.length)
    return rows[i].greeting_text!.trim()
  }, [rows])

  return { greeting, loading, error }
}
