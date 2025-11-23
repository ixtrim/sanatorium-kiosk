import TopBar from '../components/TopBar'
import MenuLink from '../components/MenuLink'
import BottomBackBar from '../components/BottomBackBar'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'

export default function Sanatorium() {
  const seconds = useIdleSecondsLeft(60_000)
  return (
    <div className="kiosk-container">
      <TopBar />

      <div className="main-menu">
        <MenuLink to="/u-nas" title="Pokoje" color="orange" />
        <MenuLink to="/u-nas" title="Wyżywienie" color="orange" />
        <MenuLink to="/u-nas" title="Zabiegi" color="orange" />
        <MenuLink to="/u-nas" title="Cennik" color="orange" />
        <MenuLink to="/u-nas" title="Co myślisz o nas?" color="orange" />
        <MenuLink to="/u-nas" title="Regulaminy" color="orange" />
        <MenuLink to="/u-nas" title="Twój personel" color="orange" />
        <MenuLink to="/u-nas" title="Nasi kuracjusze" color="orange" />
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}