import { useEffect, useState } from 'react'

export type Gallery = {
  title: string
  images: string[]
}

function gvizUrl(fileId: string, gid: string) {
  return `https://docs.google.com/spreadsheets/d/${fileId}/gviz/tq?tqx=out:json&gid=${gid}`
}

function stripGvizWrapper(txt: string) {
  const start = txt.indexOf('(')
  const end = txt.lastIndexOf(')')
  return start >= 0 && end > start ? txt.slice(start + 1, end) : txt
}

function splitImagesCell(v: unknown): string[] {
  const raw = (v ?? '').toString()
  // split on newlines, commas or semicolons; trim; keep only http(s)
  return raw
    .split(/\r?\n|,|;|\s{2,}/g)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(u => /^https?:\/\//i.test(u))
}

export function useGalleriesFromSheet(fileId: string, gid: string) {
  const [items, setItems] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(gvizUrl(fileId, gid), { cache: 'no-store' })
      .then(r => r.text())
      .then(txt => {
        if (cancelled) return
        const json = JSON.parse(stripGvizWrapper(txt))
        const allRows: any[] = json?.table?.rows ?? []
        const cols = json?.table?.cols ?? []

        // Try by labels first; fallback to positions 0 (title) and 1 (images)
        const titleIdx = cols.findIndex((c: any) => String(c?.label || '').toLowerCase() === 'title')
        const imagesIdx = cols.findIndex((c: any) => String(c?.label || '').toLowerCase() === 'images')
        const ti = titleIdx >= 0 ? titleIdx : 0
        const ii = imagesIdx >= 0 ? imagesIdx : 1

        // SKIP THE FIRST ROW (header)
        const dataRows = allRows.slice(1)

        const list: Gallery[] = dataRows
          .map((r: any) => {
            const c = r?.c || []
            const title = (c[ti]?.v ?? '').toString().trim()
            const images = splitImagesCell(c[ii]?.v)
            return { title, images }
          })
          .filter((g: Gallery) => g.title || g.images.length)

        setItems(list)
        setLoading(false)
      })
      .catch(e => {
        if (cancelled) return
        setError(e?.message || 'Błąd ładowania arkusza')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [fileId, gid])

  return { items, loading, error }
}
