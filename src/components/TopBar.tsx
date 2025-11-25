import { useEffect, useState } from 'react'
import { useKrynicaWeather } from '../hooks/useWeather'

function usePolandClock(updateEveryMs = 1000) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), updateEveryMs)
    return () => clearInterval(i)
  }, [updateEveryMs])
  const clock = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Warsaw' }).format(now)
  const day = new Intl.DateTimeFormat('pl-PL', { day: '2-digit', timeZone: 'Europe/Warsaw' }).format(now)
  const month = new Intl.DateTimeFormat('pl-PL', { month: 'long', timeZone: 'Europe/Warsaw' }).format(now).toLocaleUpperCase('pl-PL')
  return { clock, dateLabel: `${day} ${month}` }
}

export default function TopBar() {
  const logoUrl = `${import.meta.env.BASE_URL}media/brand/logo-orange.png`
  const iconUrl = `${import.meta.env.BASE_URL}media/icons/icon_black_cloud.svg`
  const { clock, dateLabel } = usePolandClock(1000)
  const weather = useKrynicaWeather(10 * 60 * 1000)

  return (
    <div className="topbar">
      <a href="/" className="topbar__brand" draggable={false} aria-label="Strona główna">
        <img src={logoUrl} alt="Sanatorium Energetyk" className="topbar__brand__img" draggable={false} />
      </a>

      <div className="topbar__meta">
        <div className="topbar__meta__time">
          <span className="topbar__meta__time__clock">{clock}</span>
          <span className="topbar__meta__time__date">{dateLabel}</span>
        </div>

        <div className="topbar__meta__weather" aria-label="pogoda">
          <div className="topbar__meta__weather__icon">
            <img src={iconUrl} alt="Pogoda" className="topbar__weather__icon__img" draggable={false} />
          </div>
          <div className="topbar__meta__weather__temp">
            {weather.loading && <span>—°C</span>}
            {!weather.loading && weather.tempC !== null && <span>{weather.tempC}°C</span>}
            {!weather.loading && weather.tempC === null && <span>—°C</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
