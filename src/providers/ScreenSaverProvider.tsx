import React from 'react'
import ScreenSaver from '../components/ScreenSaver'

type Props = {
  children: React.ReactNode
  /** when to show the screensaver after last user activity */
  afterMs?: number
}
export const ScreenSaverContext = React.createContext<{ active: boolean }>({ active: false })

export default function ScreenSaverProvider({ children, afterMs = 90_000 }: Props) {
  const [active, setActive] = React.useState(false)

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

  return (
    <ScreenSaverContext.Provider value={{ active }}>
      {children}
      <ScreenSaver visible={active} />
    </ScreenSaverContext.Provider>
  )
}
