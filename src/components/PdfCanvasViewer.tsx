// src/components/PdfCanvasViewer.tsx
import { useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'

// worker URL provided by Vite
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker

type Props = {
  fileUrl: string
  // accept the MutableRefObject coming from useRef<HTMLDivElement>(null)
  containerRef?: React.MutableRefObject<HTMLDivElement | null>
}

export default function PdfCanvasViewer({ fileUrl, containerRef }: Props) {
  const innerRef = useRef<HTMLDivElement>(null)
  const ref = containerRef ?? innerRef

  useEffect(() => {
    const container = ref.current
    if (!container || !fileUrl) return
    container.innerHTML = ''
    let cancelled = false

    ;(async () => {
      try {
        const task = (pdfjsLib as any).getDocument({ url: fileUrl })
        const pdf = await task.promise

        for (let n = 1; n <= pdf.numPages; n++) {
          if (cancelled) break
          const page = await pdf.getPage(n)

          const baseViewport = page.getViewport({ scale: 1 })
          const containerW = container.clientWidth || 1024
          const scale = containerW / baseViewport.width
          const viewport = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!

          const dpr = window.devicePixelRatio || 1
          canvas.width = Math.floor(viewport.width * dpr)
          canvas.height = Math.floor(viewport.height * dpr)
          canvas.style.width = `${Math.floor(viewport.width)}px`
          canvas.style.height = `${Math.floor(viewport.height)}px`
          canvas.style.display = 'block'
          canvas.style.margin = '0 auto'
          canvas.style.maxWidth = '100%'

          container.appendChild(canvas)
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          await page.render({ canvasContext: ctx, viewport }).promise
        }
      } catch (e) {
        container.innerHTML =
          `<div style="padding:1rem;color:#c00;font:16px/1.4 sans-serif">PDF load error: ${String(e)}</div>`
      }
    })()

    return () => { cancelled = true }
  }, [fileUrl, ref])

  return <div ref={ref} className="pdf-canvas-list" />
}
