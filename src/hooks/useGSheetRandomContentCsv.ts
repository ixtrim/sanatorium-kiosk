import { useEffect, useState } from 'react'
import Papa from 'papaparse'

export type Row = {
  date?: string
  category?: string
  title?: string
  content?: string
  source?: string
  age?: string
}

export function useGSheetRandomContentCsv(
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
        const url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv&gid=${gid}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const text = await res.text()
        const parsed = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: 'greedy',
        })

        const data: Row[] = (parsed.data || []).map((r) => ({
          date: r.date?.trim(),
          category: r.category?.trim(),
          title: r.title?.trim(),
          content: r.content ?? '',
          source: r.source?.trim(),
          age: r.age_version?.trim() ?? r.age?.trim(),
        }))

        const filtered = data.filter((r) =>
          (opts.category ? r.category === opts.category : true) &&
          (r.content?.trim()?.length || 0) > 0
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
