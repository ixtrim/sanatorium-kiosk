import { useEffect, useMemo, useState } from 'react'
import { useKrynicaWeather } from '../hooks/useWeather'
import { useSheetGreeting } from '../hooks/useSheetGreeting'

function usePolandClock(updateEveryMs = 30_000) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), updateEveryMs)
    return () => clearInterval(i)
  }, [updateEveryMs])

  const time = new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Warsaw',
  }).format(now)
  const date = new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit', month: 'long', timeZone: 'Europe/Warsaw',
  }).format(now)

  return { now, time, date }
}

function getModeByTime(d: Date) {
  const hour = +new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit', hour12: false, timeZone: 'Europe/Warsaw',
  }).format(d)
  return hour >= 6 && hour < 22 ? 'day' : 'night'
}

export default function ScreenSaver({ visible }: { visible: boolean }) {
  const { now, time, date } = usePolandClock(30_000)
  const hour = now.getHours()
  // Show screensaver if visible and (6:00-9:00 or 22:00-6:00)
  const isDay = hour >= 6 && hour < 9
  const isNight = hour >= 22 || hour < 6
  const shouldShow = visible && (isDay || isNight)
  if (!shouldShow) return null

  const mode = isDay ? 'day' : 'night'
  const { tempC } = useKrynicaWeather(10 * 60 * 1000)

  const SHEET_ID  = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
  const GID_DAY   = '2075495920'
  const GID_NIGHT = '151923958'
  const gid = mode === 'day' ? GID_DAY : GID_NIGHT

  const { greeting } = useSheetGreeting(SHEET_ID, gid, {
    refreshMs: 30 * 60 * 1000,
    cacheKey: `greetings:${gid}`,
  })

  const logoUrl    = `${import.meta.env.BASE_URL}media/brand/logo-white.svg`
  const weatherUrl = `${import.meta.env.BASE_URL}media/icons/icon_white_cloud.svg`

  const fallbackDay   = 'ZDROWIE ZACZYNA SIĘ OD CHWILI SPOKOJU.'
  const fallbackNight = 'SANATORIUM – MIEJSCE, GDZIE REGENERUJE SIĘ CIAŁO I DUSZA.'
  const quote = greeting || (mode === 'day' ? fallbackDay : fallbackNight)

  return (
    <div className={`screensaver screensaver--${mode}`} role="dialog" aria-label="Wygaszacz ekranu">
      <div className="screensaver__center">
        <img src={logoUrl} alt="" className="screensaver__center__logo" draggable={false} />
        <div className="screensaver__center__time">{time}</div>
        <div className="screensaver__center__date">{date}</div>
        <div className="screensaver__center__weather">
          <img src={weatherUrl} className="screensaver__center__weather__icon" alt="" />
          <div className="screensaver__center__weather__temp">{tempC != null ? `${tempC}°C` : '—°C'}</div>
        </div>
        <div className="screensaver__center__quote">{quote}</div>
      </div>
    </div>
  )
}
