import { useEffect, useState } from 'react'

export type Room = {
  floor: string          // A
  roomNumber: string     // B
  title: string          // C
  content: string        // D
  images: string[]       // E (w jednej komórce, kilka linków)
}

function parseGviz(text: string) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  return JSON.parse(text.slice(start, end + 1))
}

function val(row: any, i: number): string {
  const c = row?.c?.[i]
  return ((c?.v ?? c?.f ?? '') + '').trim()
}

function extractImageUrls(raw: string): string[] {
  if (!raw) return []
  // wyłapujemy wszystkie http/https
  const urls = raw.match(/https?:\/\/\S+/g) || []
  // obcinamy ewentualne ogonki (przecinki, średniki)
  return urls.map(u => u.replace(/[),.;]+$/,''))
}

export function useGalleryFromSheet(fileId: string, gid: string) {
  const [items, setItems] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        // GViz działa bez publikowania arkusza:
        const url = `https://docs.google.com/spreadsheets/d/${fileId}/gviz/tq?tqx=out:json&gid=${gid}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = parseGviz(await res.text())
        const rows: Room[] = (json?.table?.rows ?? [])
          .map((r: unknown) => {
            const floor   = val(r, 0)  // A
            const number  = val(r, 1)  // B
            const title   = val(r, 2)  // C
            const content = val(r, 3)  // D
            const images  = extractImageUrls(val(r, 4)) // E
            return { floor, roomNumber: number, title, content, images }
          })
          // odfiltruj nagłówek i puste
          .filter((r: Room) =>
            r.floor.toLowerCase() !== 'floor_level' &&
            r.roomNumber.toLowerCase() !== 'room_number' &&
            (r.floor || r.roomNumber || r.title || r.content || r.images.length)
          )

        if (!cancel) setItems(rows)
      } catch (e: unknown) {
        if (!cancel) setError(e instanceof Error ? e.message : 'Fetch error')
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    run()
    return () => { cancel = true }
  }, [fileId, gid])

  return { items, loading, error }
}
