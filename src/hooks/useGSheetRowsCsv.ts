import { useEffect, useState } from 'react'
import Papa from 'papaparse'

export type TripRow = {
  date?: string
  category?: string
  title?: string
  content?: string
  source?: string
  age?: string
  image?: string
}

/** Czyści i normalizuje tekst (np. nowe linie z CRLF). */
const clean = (s?: string) => (s ? s.replace(/\r\n/g, '\n').trim() : '')

/** Pobiera wiersze z arkusza (CSV export), bez losowania. */
export function useGSheetRowsCsv(
  fileId: string,
  gid: string,
  opts: { category?: string } = {}
) {
  const [rows, setRows] = useState<TripRow[]>([])
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

        const data: TripRow[] = (parsed.data || []).map((r) => ({
          date: clean(r.date ?? r['Date']),
          category: clean(r.category),
          title: clean(r.title),
          content: clean(r.content),
          source: clean(r.source),
          age: clean(r.age_version ?? r.age),
          image: clean(r.image ?? r.Image ?? r.img),
        }))

        // 2..last: pomijamy puste, filtr po kategorii gdy podana
        const filtered = data.filter(r =>
          (opts.category ? r.category === opts.category : true) &&
          (r.title?.length || r.content?.length || r.image?.length)
        )

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

  return { rows, loading, error }
}
