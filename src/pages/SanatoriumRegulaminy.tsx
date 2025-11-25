import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'

type Item = { title: string; file: string }

export default function SanatoriumRegulaminy() {
  const seconds = useIdleSecondsLeft(60_000)
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    fetch('/media/regulaminy/index.json', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Item[]) => setItems(data))
      .catch(() => setItems([]))
  }, [])

  return (
    <div className="kiosk-container">
      <TopBar />
      <div className="view-regulaminy">
        <ViewHeading title="Regulaminy" color="orange" />

        <div className="view-regulaminy__list">
          {items.map((it, i) => (
            <Link
              key={i}
              to={`/sanatorium-regulaminy-pdfreader?url=${encodeURIComponent(it.file)}&title=${encodeURIComponent(it.title)}`}
              className="reg-item"
            >
              <span className="reg-item__title">{it.title}</span>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="reg-empty">Brak pozycji w /media/regulaminy/index.json</div>
          )}
        </div>
      </div>
      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
