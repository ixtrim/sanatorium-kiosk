import TopBar from '../components/TopBar'
import MenuLink from '../components/MenuLink'
import BottomBackBar from '../components/BottomBackBar'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'

export default function Krynica() {
  const seconds = useIdleSecondsLeft(60_000)
  return (
    <div className="kiosk-container">
      <TopBar />

      <div className="section-menu">
        <MenuLink to="/krynica-wydarzenia" title="Najbliższe wydarzenia" color="blue" />
        <MenuLink to="/krynica-atrakcje-lato" title="Atrakcje latem" color="blue" />
        <MenuLink to="/krynica-atrakcje-zima" title="Atrakcje zimą" color="blue" />
        <MenuLink to="/krynica-atrakcje-caloroczne" title="Atrakcje całoroczne" color="blue" />
        <MenuLink to="/krynica-kosciol" title="Kościół" color="blue" />
        <MenuLink to="/krynica-wycieczki" title="Wycieczki" color="blue" />
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}