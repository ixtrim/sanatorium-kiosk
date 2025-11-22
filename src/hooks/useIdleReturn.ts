import { useEffect } from 'react'

export function useIdleReturn(cb:()=>void, ms=60000) {
  useEffect(() => {
    let t:number
    const reset = () => { clearTimeout(t); t = window.setTimeout(cb, ms) }
    const evts = ['click','touchstart','keydown','mousemove']
    evts.forEach(e=>window.addEventListener(e, reset, {passive:true}))
    reset()
    return () => { clearTimeout(t); evts.forEach(e=>window.removeEventListener(e, reset)) }
  }, [cb, ms])
}
