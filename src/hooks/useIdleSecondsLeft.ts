import { useEffect, useState } from 'react'

export function useIdleSecondsLeft(timeoutMs = 60_000) {
  const [left, setLeft] = useState(Math.ceil(timeoutMs / 1000))

  useEffect(() => {
    if (!(window as any).__idle_last) (window as any).__idle_last = Date.now()

    const mark = () => ((window as any).__idle_last = Date.now())
    const evts = ['click','touchstart','keydown','mousemove']
    evts.forEach(e => window.addEventListener(e, mark, { passive: true }))

    const tick = () => {
      const last = (window as any).__idle_last as number
      const ms = timeoutMs - (Date.now() - last)
      setLeft(Math.max(0, Math.ceil(ms / 1000)))
    }
    const i = setInterval(tick, 1000); tick()

    return () => { clearInterval(i); evts.forEach(e => window.removeEventListener(e, mark)) }
  }, [timeoutMs])

  return left
}
