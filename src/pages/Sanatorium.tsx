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
        <MenuLink to="/sanatorium-pokoje" title="Pokoje" color="orange" />
        <MenuLink to="/sanatorium-wyzywienie" title="Wyżywienie" color="orange" />
        <MenuLink to="/sanatorium-zabiegi" title="Zabiegi" color="orange" />
        <MenuLink to="/sanatorium-cennik" title="Cennik" color="orange" />
        <MenuLink to="/sanatorium-opinie" title="Co myślisz o nas?" color="orange" />
        <MenuLink to="/sanatorium-regulaminy" title="Regulaminy" color="orange" />
        <MenuLink to="/sanatorium-personel" title="Twój personel" color="orange" />
        <MenuLink to="/sanatorium-kuracjusze" title="Nasi kuracjusze" color="orange" />
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}