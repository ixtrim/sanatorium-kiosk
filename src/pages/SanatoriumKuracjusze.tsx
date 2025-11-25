import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRandomContent } from '../hooks/useGSheetRandomContent'
import { useState } from 'react'

const FILE_ID = '1TqSspYR7J_rKmIp5N14p7RgyPQYSpIqN5kFsl6PLflI'
const GID = '492714709'

export default function SanatoriumKuracjusze() {
  const seconds = useIdleSecondsLeft(60_000)

  const { loading, error, first, pickRandom } =
    useGSheetRandomContent(FILE_ID, GID, { category: 'nasi_kuracjusze' })

  const [item, setItem] = useState(first)
  
  if (!item && first) setItem(first)

  return (
    <div className="kiosk-container view-sanatorium-kuracjusze">
      <TopBar />
      <ViewHeading title="Kuracjusze" color="orange" />

      <div className="view-content">
        {loading && <p>Ładowanie…</p>}
        {error && <p>Błąd: {error}</p>}
        {!loading && !error && !item && <p>Brak treści do wyświetlenia.</p>}
        {!loading && !error && item && (
          <article>
            {item.title && <h2 className="view-content-title">{item.title}</h2>}
            <p className="view-content-text">{item.content}</p>
          </article>
        )}
      </div>

      <div className="view-content-actions">
        <button className="kiosk-btn kiosk-btn--outline" onClick={() => setItem(pickRandom())}>
          Przeładuj
        </button>
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
