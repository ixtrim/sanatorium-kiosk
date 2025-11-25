import { useEffect, useState } from 'react'
import Papa from 'papaparse'

export type RoomItem = {
  title: string
  content: string
  images: string[]
}

const clean = (s?: string) => (s ? s.replace(/\r\n/g, '\n').trim() : '')

function extractImageUrl(raw?: string): string | undefined {
  if (!raw) return undefined
  const m = raw.match(/https?:\/\/[^\s")]+/i)
  return m ? m[0] : undefined
}

type Row = {
  title?: string
  content?: string
  image?: string // optional, not null
}

export function useRoomsFromSheetCsv(fileId: string, gid: string) {
  const [items, setItems] = useState<RoomItem[]>([])
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

        const rows: Row[] = (parsed.data || []).map((r) => ({
          title: clean(r.title),
          content: clean(r.content),
          image: extractImageUrl(r.image) ?? undefined, // <- normalize to undefined
        }))

        const grouped: RoomItem[] = []
        let current: RoomItem | null = null

        for (const r of rows) {
          const hasMain = !!(r.title || r.content)
          const img = r.image

          if (hasMain) {
            current = {
              title: r.title || '',
              content: r.content || '',
              images: img ? [img] : [],
            }
            grouped.push(current)
          } else if (img && current) {
            current.images.push(img)
          }
        }

        const limited = grouped.map((g) => ({
          ...g,
          images: g.images.slice(0, 5),
        }))

        if (!cancelled) setItems(limited)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Fetch error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [fileId, gid])

  return { items, loading, error }
}
