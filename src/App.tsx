import { Route, Routes, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Ciekawostki from './pages/Ciekawostki'
import Sanatorium from './pages/Sanatorium'
import Krynica from './pages/Krynica'
import PdfView from './pages/PdfView'
import GalleryPage from './pages/GalleryPage'
import { useIdleReturn } from './hooks/useIdleReturn'

export default function App() {
  const nav = useNavigate()
  useIdleReturn(() => nav('/'), 60_000) // powrót po 60 s bezczynności

  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/krynica" element={<Krynica/>}/>
        <Route path="/ciekawostki" element={<Ciekawostki/>}/>
        <Route path="/sanatorium" element={<Sanatorium/>}/>
        <Route path="/pdf" element={<PdfView/>}/>
        <Route path="/gallery" element={<GalleryPage/>}/>
      </Routes>
    </div>
  )
}
