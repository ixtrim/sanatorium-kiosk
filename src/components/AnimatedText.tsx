import { useEffect, useRef } from 'react'

type Props = {
  text?: string | null
  className?: string
}

export default function AnimatedText({ text = '', className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const safe = text ?? ''
  const lines = safe.split(/\r?\n/)

  // Restart CSS animation on text change
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    el.classList.remove('is-run');
    // force reflow (note the semicolon/void to avoid ASI)
    void el.offsetWidth;
    el.classList.add('is-run')
  }, [safe])

  return (
    <div ref={wrapRef} className={`reveal-lines is-run ${className}`}>
      {lines.map((ln, i) => (
        <span
          key={`${i}-${ln.length}`}
          className="reveal-line"
          style={{ ['--i' as any]: i } as React.CSSProperties}
        >
          {ln || '\u00A0'}
        </span>
      ))}
    </div>
  )
}
