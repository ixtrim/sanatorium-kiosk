import { useEffect, useRef, useState } from 'react'

type Props = {
  text?: string
  className?: string
  speedMs?: number
  startDelayMs?: number
}

export default function TypewriterText({
  text = '',
  className = '',
  speedMs = 18,
  startDelayMs = 0,
}: Props) {
  const [shown, setShown] = useState('')
  const timerRef = useRef<number | null>(null)
  const delayRef = useRef<number | null>(null)

  useEffect(() => {
    setShown('')
    if (delayRef.current) window.clearTimeout(delayRef.current)
    if (timerRef.current) window.clearInterval(timerRef.current)

    const run = () => {
      let i = 0
      timerRef.current = window.setInterval(() => {
        i++
        setShown(text.slice(0, i))
        if (i >= text.length && timerRef.current) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
        }
      }, Math.max(8, speedMs))
    }

    if (startDelayMs > 0) {
      delayRef.current = window.setTimeout(run, startDelayMs)
    } else {
      run()
    }

    return () => {
      if (delayRef.current) window.clearTimeout(delayRef.current)
      if (timerRef.current) window.clearInterval(timerRef.current)
      delayRef.current = null
      timerRef.current = null
    }
  }, [text, speedMs, startDelayMs])

  return (
    <div className={`typewriter ${className}`} aria-live="polite">
      {shown}
      <span className="typewriter__cursor" aria-hidden>|</span>
    </div>
  )
}
