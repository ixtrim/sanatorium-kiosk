import { Route, Routes, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
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
        <Route path="/pdf" element={<PdfView/>}/>
        <Route path="/gallery" element={<GalleryPage/>}/>
      </Routes>
    </div>
  )
}
