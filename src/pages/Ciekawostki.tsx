import TopBar from '../components/TopBar'
import MenuLink from '../components/MenuLink'
import BottomBackBar from '../components/BottomBackBar'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'

export default function Ciekawostki() {
  const seconds = useIdleSecondsLeft(60_000)
  return (
    <div className="kiosk-container">
      <TopBar />

      <div className="main-menu">
        <MenuLink to="/u-nas" title="Czy wiesz że?" color="green" />
        <MenuLink to="/u-nas" title="Ćwiczenia" color="green" />
        <MenuLink to="/u-nas" title="Porady" color="green" />
        <MenuLink to="/u-nas" title="Historia uzdrowisk" color="green" />
        <MenuLink to="/u-nas" title="Humor" color="green" />
        <MenuLink to="/u-nas" title="Gra" color="green" />
        <MenuLink to="/u-nas" title="Sanatoryjny savoir vivre" color="green" />
        <MenuLink to="/u-nas" title="Kalendarium" color="green" />
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}