import { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import InlineGameFrame from '../components/InlineGameFrame'

export default function CiekawostkiGryPlay() {
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const seconds = useIdleSecondsLeft(60_000)

  const file = sp.get('file') || ''
  const title = sp.get('title') || 'Gra'

  // Built bundles live in /public/media/gry-built/*.js
  const builtUrl = useMemo(() => {
    const base = `${import.meta.env.BASE_URL}media/gry-built/`
    return file ? base + file : ''
  }, [file])

  const backToList = () => nav('/ciekawostki-gry')

  return (
    <div className="kiosk-container view-ciekawostki-gry">
      <TopBar />
      <ViewHeading title={title} color="green" />

      <section className="content-container">
        {!file ? (
          <p>Brak pliku gry.</p>
        ) : (
          <InlineGameFrame
            title={title}
            gameUrl={builtUrl}
            onClose={backToList}
            height="78vh"
          />
        )}
      </section>

      <BottomBackBar secondsLeft={seconds} backTo="/ciekawostki-gry" />
    </div>
  )
}
