import TopBar from '../components/TopBar'
import MenuLink from '../components/MenuLink'
import BottomBackBar from '../components/BottomBackBar'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'

export default function Krynica() {
  const seconds = useIdleSecondsLeft(60_000)
  return (
    <div className="kiosk-container">
      <TopBar />

      <div className="main-menu">
        <MenuLink to="/gallery" title="Najbliższe wydarzenia" color="blue" />
        <MenuLink to="/pdf?url=/media/przyklad.pdf" title="Atrakcje latem" color="blue" />
        <MenuLink to="/krynica-atrakcje-zima" title="Atrakcje zimą" color="blue" />
        <MenuLink to="/krynica-atrakcje-caloroczne" title="Atrakcje całoroczne" color="blue" />
        <MenuLink to="/krynica-kosciol" title="Kościół" color="blue" />
        <MenuLink to="/krynica-wycieczki" title="Wycieczki" color="blue" />
      </div>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}