import { useEffect, useMemo, useState } from 'react'

type Row = { date?: string; category?: string; title?: string; content?: string; age?: string }

function parseGviz(text: string) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  return JSON.parse(text.slice(start, end + 1))
}

function cell(row: any, i: number) {
  const c = row?.c?.[i]
  return (c?.v ?? c?.f ?? '') as string
}

export function useGSheetRandomContent(
  fileId: string,
  gid: string,
  opts: { category?: string } = {}
) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const url =
          `https://docs.google.com/spreadsheets/d/${fileId}/gviz/tq?tqx=out:json&gid=${gid}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = parseGviz(await res.text())
        const data: Row[] = (json?.table?.rows ?? []).map((r: any) => ({
          date:     cell(r, 0),
          category: cell(r, 1),
          title:    cell(r, 2),
          content:  cell(r, 3),
          age:      cell(r, 5),
        }))
        const norm = (s?: string) => (s ?? '').toString().trim().toLowerCase()
        const filtered = data.filter((r) => {
        const hasContent = !!(r.content && r.content.trim().length > 0)
          if (!hasContent) return false
          if (!opts.category) return true
          return norm(r.category) === norm(opts.category)
        })

        if (!cancelled) setRows(filtered)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Fetch error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [fileId, gid, opts.category])

  const pickRandom = () => {
    if (!rows.length) return null
    const idx = Math.floor(Math.random() * rows.length)
    return rows[idx]
  }

  const first = useMemo(pickRandom, [rows])

  return { rows, loading, error, first, pickRandom }
}
