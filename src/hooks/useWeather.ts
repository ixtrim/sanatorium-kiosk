import { useEffect, useState } from 'react'

type Weather = { tempC: number | null; updatedAt?: string; error?: string; loading: boolean }

export function useKrynicaWeather(refreshMs = 10 * 60 * 1000) {
  const [data, setData] = useState<Weather>({ tempC: null, loading: true })

  useEffect(() => {
    let abort = false
    const lat = 49.4223
    const lon = 20.9594

    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=Europe%2FWarsaw`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const temp = json?.current?.temperature_2m
        if (!abort) {
          setData({ tempC: typeof temp === 'number' ? Math.round(temp) : null, loading: false, updatedAt: json?.current?.time })
        }
      } catch (e: any) {
        if (!abort) setData((prev) => ({ ...prev, loading: false, error: e?.message ?? 'error' }))
      }
    }

    fetchWeather()
    const id = setInterval(fetchWeather, refreshMs)
    return () => { abort = true; clearInterval(id) }
  }, [refreshMs])

  return data
}
