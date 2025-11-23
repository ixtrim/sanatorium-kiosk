import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import MainLink from '../components/MainLink'

export default function Home() {
  return (
    <div className="kiosk-container">
      <TopBar />

      <div className="main-menu">
        <MainLink
          to="/ciekawostki"
          title="Ciekawostki dnia"
          subtitle="Informacje o pokojach, zabiegach, wyżywieniu"
          color="green"
          icon={<img src="/media/icons/icon_white_book.svg" alt="Ciekawostki dnia" />}
        />
        <MainLink
          to="/sanatorium"
          title="U nas w sanatorium"
          subtitle="Aktualności, ogłoszenia, ważne informacje"
          color="orange"
          icon={<img src="/media/icons/icon_white_chair.svg" alt="U nas w sanatorium" />}
        />
        <MainLink
          to="/krynica"
          title="Z życia Krynicy"
          subtitle="Atrakcje w mieście i okolicy"
          color="blue"
          icon={<img src="/media/icons/icon_white_climbing.svg" alt="Z życia Krynicy" />}
        />
      </div>
    </div>
  )
}
