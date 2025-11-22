import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'

export default function Home() {
  return (
    <div className="kiosk-container">
      <TopBar />

      <div className="main-menu">
        <Link to="/gallery" className="kiosk-btn kiosk-btn--green">Galeria zdjęć</Link>
        <Link to="/gallery" className="kiosk-btn kiosk-btn--green">Galeria zdjęć</Link>
        <Link to="/gallery" className="kiosk-btn kiosk-btn--green">Galeria zdjęć</Link>
        
        <Link to="/gallery" className="kiosk-btn kiosk-btn--green">Galeria zdjęć</Link>
        <Link to="/pdf?url=/media/przyklad.pdf" className="kiosk-btn kiosk-btn--orange">Otwórz PDF</Link>
      </div>
    </div>
  )
}
