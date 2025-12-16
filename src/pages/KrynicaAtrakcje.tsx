import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import PdfCanvasViewer from '../components/PdfCanvasViewer'

export default function KrynicaAtrakcje() {
  const seconds = useIdleSecondsLeft(60_000)
  
  const url = `${import.meta.env.BASE_URL}media/atrakcje-caly-rok.pdf`
  const title = 'Atrakcje całoroczne'

  const listRef = useRef<HTMLDivElement>(null)

  const [canUp, setCanUp] = useState(false)
  const [canDown, setCanDown] = useState(false)

  const IconUpUrl   = `${import.meta.env.BASE_URL}media/icons/icon_black_up.svg`
  const IconDownUrl = `${import.meta.env.BASE_URL}media/icons/icon_black_arrow-down.svg`

  const updateScrollState = () => {
    const el = listRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    const eps = 1
    setCanUp(el.scrollTop > eps)
    setCanDown(el.scrollTop < max - eps)
  }

  const scrollBy = (dir: 'up' | 'down') => {
    const el = listRef.current
    if (!el) return
    const step = Math.round(el.clientHeight * 0.9)
    el.scrollBy({ top: dir === 'up' ? -step : step, behavior: 'smooth' })
    requestAnimationFrame(() => setTimeout(updateScrollState, 250))
  }

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    
    updateScrollState()

    const onScroll = () => updateScrollState()
    el.addEventListener('scroll', onScroll, { passive: true })
    
    const onWheel = (e: WheelEvent) => {
      const canScrollUp = e.deltaY < 0 && canUp
      const canScrollDown = e.deltaY > 0 && canDown
      if (canScrollUp || canScrollDown) {
        e.preventDefault()
        el.scrollBy({ top: e.deltaY, behavior: 'auto' })
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    
    const mo = new MutationObserver(updateScrollState)
    mo.observe(el, { childList: true, subtree: true })

    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      ro.disconnect()
      mo.disconnect()
    }
  }, [canUp, canDown])

  return (
    <div className="kiosk-container pdf-layout">
      <TopBar />
      <ViewHeading title={title} color="blue" />

      <section className="content-container-pdf-short">

        <div className="pdf-zone">
          <button
            className={`pdf-scroll-btn pdf-scroll-btn--top ${!canUp ? 'is-disabled' : ''}`}
            onClick={() => scrollBy('up')}
          >
            <img src={IconUpUrl} alt="" width={45} height={45} className="bottom-back-bar__icon-img" draggable={false} />
            <span>PRZEWIŃ W GÓRĘ</span>
          </button>

          <div className="pdf-scrollable" ref={listRef}>
            <PdfCanvasViewer fileUrl={url} containerRef={listRef} />
          </div>

          <button
            className={`pdf-scroll-btn pdf-scroll-btn--bottom ${!canDown ? 'is-disabled' : ''}`}
            onClick={() => scrollBy('down')}
          >
            <img src={IconDownUrl} alt="" width={45} height={45} className="bottom-back-bar__icon-img" draggable={false} />
            <span>PRZEWIŃ W DÓŁ</span>
          </button>
        </div>

      </section>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
