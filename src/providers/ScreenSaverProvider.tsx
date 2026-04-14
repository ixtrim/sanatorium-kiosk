import React from 'react'
import ScreenSaver from '../components/ScreenSaver'
import InteractionBlocker from '../components/InteractionBlocker'


type Props = {
  children: React.ReactNode
  afterMs?: number
}

export const ScreenSaverContext = React.createContext<{ active: boolean }>({ active: false })

export default function ScreenSaverProvider({ children, afterMs = 90_000 }: Props) {
  const [active, setActive] = React.useState(false)
  const [blockInteraction, setBlockInteraction] = React.useState(false)

  React.useEffect(() => {
    let last = Date.now()
    const bump = () => { last = Date.now(); if (active) setActive(false) }
    const evts = ['click','touchstart','keydown','mousemove','scroll']
    evts.forEach(e => window.addEventListener(e, bump, { passive: true }))

    const i = setInterval(() => {
      if (!active && Date.now() - last >= afterMs) setActive(true)
    }, 1000)

    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(false) }
    window.addEventListener('keydown', onEscape)

    return () => {
      clearInterval(i); window.removeEventListener('keydown', onEscape)
      evts.forEach(e => window.removeEventListener(e, bump))
    }
  }, [active, afterMs])

  // Block interaction for 1s after screensaver closes
  React.useEffect(() => {
    if (!active) {
      setBlockInteraction(true)
      const t = setTimeout(() => setBlockInteraction(false), 1000)
      return () => clearTimeout(t)
    }
  }, [active])

  return (
    <ScreenSaverContext.Provider value={{ active }}>
      {children}
      <ScreenSaver visible={active} />
      <InteractionBlocker active={blockInteraction} durationMs={1000} />
    </ScreenSaverContext.Provider>
  )
}
