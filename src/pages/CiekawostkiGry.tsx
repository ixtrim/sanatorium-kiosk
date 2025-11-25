import { useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import GameOverlay from '../components/GameOverlay'

type Game = { title: string; file: string; icon?: string }

export default function CiekawostkiGry() {
  const seconds = useIdleSecondsLeft(60_000)

  const games: Game[] = [
    {
      title: 'Gra „Baloniki”',
      file: 'baloniki_prosta_gra_do_kiosku_portrait_1080_1920.js',
      icon: `${import.meta.env.BASE_URL}media/graphics/balloons.png`, // optional
    },
    {
      title: 'Gra „Kółko i Krzyżyk”',
      file: 'kolko_i_krzyzyk_komponent_do_infokiosku_portrait_1080_1920.js',
      icon: `${import.meta.env.BASE_URL}media/graphics/tic-tac-toe.png`,
    },
    {
      title: 'Gra „Simon”',
      file: 'simon_gra_do_kiosku_portrait_1080_1920.js',
      icon: `${import.meta.env.BASE_URL}media/graphics/game-console.png`,
    },
  ]

  const [open, setOpen] = useState<Game | null>(null)

  const base = `${import.meta.env.BASE_URL}media/gry/`
  const gameUrl = open ? base + open.file : ''

  return (
    <div className="kiosk-container view-ciekawostki-gry">
      <TopBar />
      <ViewHeading title="Gry" color="green" />

      <div className="games-grid">
        {games.map((g) => (
          <button
            key={g.file}
            className="game-card"
            onClick={() => setOpen(g)}
          >
            <span className="game-card__icon" aria-hidden>
              {g.icon ? (
                <img src={g.icon} alt="" draggable={false} />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 12h12a3 3 0 0 1 3 3v2a2 2 0 0 1-2 2h-3l-2-2H10l-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 1 3-3z"/><circle cx="8.5" cy="11.5" r="1"/><circle cx="15.5" cy="11.5" r="1"/>
                </svg>
              )}
            </span>
            <span className="game-card__title">{g.title}</span>
            <span className="game-card__cta">Zagraj teraz</span>
          </button>
        ))}
      </div>

      {open && (
        <GameOverlay
          title={open.title}
          gameUrl={gameUrl}
          onClose={() => setOpen(null)}
        />
      )}

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
