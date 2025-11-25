import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'

type Row = { greeting_text?: string | null }

type Options = {
  refreshMs?: number
  cacheKey?: string
  pickKey?: any
}

export function useSheetGreeting(sheetId: string, gid: string, opts: Options = {}) {
  const { refreshMs = 60 * 60 * 1000, cacheKey = `${sheetId}:${gid}`, pickKey } = opts
  const [rows, setRows] = useState<Row[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = localStorage.getItem(`quotes:${cacheKey}`)
    if (cached) {
      try { setRows(JSON.parse(cached) as Row[]) } catch {}
    }
  }, [cacheKey])

  useEffect(() => {
    let aborted = false

    async function load() {
      setLoading(true)
      setError(null)

      const directUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`

      try {
        const res = await fetch(directUrl, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()

        const parsed = Papa.parse<Row>(text, {
          header: true,
          skipEmptyLines: true,
        })

        const clean: Row[] = (parsed.data || [])
          .map((r: Row) => ({ greeting_text: r.greeting_text }))
          .filter((r: Row) => !!r.greeting_text && r.greeting_text!.trim().length > 0)

        if (!aborted) {
          setRows(clean)
          localStorage.setItem(`quotes:${cacheKey}`, JSON.stringify(clean))
        }
      } catch (e: unknown) {
        if (!aborted) setError((e as Error)?.message ?? 'fetch_error')
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, refreshMs)
    return () => { aborted = true; clearInterval(id) }
  }, [sheetId, gid, refreshMs, cacheKey])

  const greeting = useMemo(() => {
    if (!rows || rows.length === 0) return null
    const i = Math.floor(Math.random() * rows.length)
    return rows[i].greeting_text!.trim()
  }, [rows, pickKey])

  return { greeting, loading, error }
}
