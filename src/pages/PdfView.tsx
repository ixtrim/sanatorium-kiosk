import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'

/**
 * Wyświetla PDF w osadzonym viewerze PDF.js.
 * Oczekuje query params:
 *   - url  : adres PDF (np. /media/przyklad.pdf)
 *   - page : (opc.) numer strony, domyślnie 1
 *   - zoom : (opc.) 'page-width' | 'page-fit' | np. '125'
 */
export default function PdfView() {
  const nav = useNavigate()
  const [sp] = useSearchParams()

  const url  = sp.get('url')  || ''
  const page = sp.get('page') || '1'
  const zoom = sp.get('zoom') || 'page-width'

  const viewerSrc = useMemo(() => {
    if (!url) return ''
    // PDF.js viewer z parametrami: strona, zoom, bez paneli bocznych
    return `/pdfjs/viewer.html?file=${encodeURIComponent(url)}#page=${encodeURIComponent(
      page
    )}&zoom=${encodeURIComponent(zoom)}&pagemode=none`
  }, [url, page, zoom])

  // ESC = powrót
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') nav(-1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav])

  if (!url) {
    return (
      <div className="w-screen h-screen grid place-items-center p-6">
        <div className="max-w-xl text-center">
          <p className="mb-6 text-xl">Brak adresu pliku PDF.</p>
          <button onClick={() => nav(-1)} className="bg-black text-white rounded-xl px-6 py-3">
            Powrót
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen relative" onContextMenu={(e) => e.preventDefault()}>
      <button
        onClick={() => nav(-1)}
        className="absolute left-4 top-4 z-10 bg-black/70 text-white rounded-xl px-4 py-2"
      >
        Powrót
      </button>

      <iframe
        title="PDF"
        src={viewerSrc}
        className="w-full h-full border-0"
        allow="fullscreen"
      />
    </div>
  )
}
