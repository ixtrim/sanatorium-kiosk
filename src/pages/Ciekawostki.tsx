import TopBar from '../components/TopBar'
import MenuLink from '../components/MenuLink'
import BottomBackBar from '../components/BottomBackBar'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'

export default function Ciekawostki() {
  const seconds = useIdleSecondsLeft(60_000)
  return (
    <div className="kiosk-container">
      <TopBar />

      <div className="section-menu">
        <MenuLink to="/ciekawostki-czy-wiesz" title="Czy wiesz że?" color="green" />
        <MenuLink to="/ciekawostki-cwiczenia" title="Ćwiczenia" color="green" />
        <MenuLink to="/ciekawostki-porady" title="Porady" color="green" />
        <MenuLink to="/ciekawostki-historia" title="Historia uzdrowisk" color="green" />
        <MenuLink to="/ciekawostki-humor" title="Humor" color="green" />
        <MenuLink to="/ciekawostki-gry" title="Gry" color="green" />
        <MenuLink to="/ciekawostki-savoir-vivre" title="Sanatoryjny savoir vivre" color="green" />
        <MenuLink to="/ciekawostki-kalendarium" title="Kalendarium" color="green" />
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}