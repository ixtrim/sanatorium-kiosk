import React, { useEffect, useState } from 'react'

/**
 * Blocks all pointer and keyboard interaction for a given duration.
 * Usage: <InteractionBlocker active={true} durationMs={1000} />
 */
export default function InteractionBlocker({ active, durationMs = 1000 }: { active: boolean, durationMs?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), durationMs)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [active, durationMs])

  if (!visible) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'transparent',
        pointerEvents: 'all',
      }}
      tabIndex={-1}
      aria-hidden="true"
    />
  )
}
