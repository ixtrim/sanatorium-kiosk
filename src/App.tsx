import { Route, Routes, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Ciekawostki from './pages/Ciekawostki'
import CiekawostkiCzyWiesz from './pages/CiekawostkiCzyWiesz'
import CiekawostkiCwiczenia from './pages/CiekawostkiCwiczenia'
import CiekawostkiPorady from './pages/CiekawostkiPorady'
import CiekawostkiHistoria from './pages/CiekawostkiHistoria'
import CiekawostkiHumor from './pages/CiekawostkiHumor'
import CiekawostkiGry from './pages/CiekawostkiGry'
import CiekawostkiGryPlay from './pages/CiekawostkiGryPlay'
import CiekawostkiSavoirVivre from './pages/CiekawostkiSavoirVivre'
import CiekawostkiKalendarium from './pages/CiekawostkiKalendarium'
import Sanatorium from './pages/Sanatorium'
import SanatoriumCennik from './pages/SanatoriumCennik'
import SanatoriumPokoje from './pages/SanatoriumPokoje'
import SanatoriumPokojePietro from './pages/SanatoriumPokojePietro'
import SanatoriumPokojePietroPokoj from './pages/SanatoriumPokojePietroPokoj'
import SanatoriumKuracjusze from './pages/SanatoriumKuracjusze'
import SanatoriumPersonel from './pages/SanatoriumPersonel'
import SanatoriumOpinie from './pages/SanatoriumOpinie'
import SanatoriumRegulaminy from './pages/SanatoriumRegulaminy'
import SanatoriumWyzywienie from './pages/SanatoriumWyzywienie'
import SanatoriumZabiegi from './pages/SanatoriumZabiegi'
import RegulaminView from './pages/RegulaminView'
import CennikView from './pages/CennikView'
import Krynica from './pages/Krynica'
import KrynicaAtrakcje from './pages/KrynicaAtrakcje'
import KrynicaAtrakcjeLatem from './pages/KrynicaAtrakcjeLatem'
import KrynicaAtrakcjeZima from './pages/KrynicaAtrakcjeZima'
import KrynicaWycieczki from './pages/KrynicaWycieczki'
import KrynicaKosciol from './pages/KrynicaKosciol'
import KrynicaWydarzenia from './pages/KrynicaWydarzenia'
import PdfView from './pages/PdfView'
import GalleryPage from './pages/GalleryPage'
import { useIdleReturn } from './hooks/useIdleReturn'
import ScreenSaverProvider from './providers/ScreenSaverProvider'

export default function App() {
  const nav = useNavigate()
  useIdleReturn(() => nav('/'), 60_000)

  return (
    <div className="h-full">
      <ScreenSaverProvider afterMs={90_000}>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/krynica" element={<Krynica/>}/>
          <Route path="/krynica-atrakcje" element={<KrynicaAtrakcje/>}/>
          <Route path="/krynica-atrakcje-lato" element={<KrynicaAtrakcjeLatem/>}/>
          <Route path="/krynica-atrakcje-zima" element={<KrynicaAtrakcjeZima/>}/>
          <Route path="/krynica-atrakcje-caloroczne" element={<KrynicaAtrakcje/>}/>
          <Route path="/krynica-wycieczki" element={<KrynicaWycieczki/>}/>
          <Route path="/krynica-kosciol" element={<KrynicaKosciol/>}/>
          <Route path="/krynica-wydarzenia" element={<KrynicaWydarzenia/>}/>
          <Route path="/ciekawostki" element={<Ciekawostki/>}/>
          <Route path="/ciekawostki-czy-wiesz" element={<CiekawostkiCzyWiesz/>}/>
          <Route path="/ciekawostki-cwiczenia" element={<CiekawostkiCwiczenia/>}/>
          <Route path="/ciekawostki-porady" element={<CiekawostkiPorady/>}/>
          <Route path="/ciekawostki-historia" element={<CiekawostkiHistoria/>}/>
          <Route path="/ciekawostki-humor" element={<CiekawostkiHumor/>}/>
          <Route path="/ciekawostki-gry" element={<CiekawostkiGry/>}/>
          <Route path="/ciekawostki-gry/graj" element={<CiekawostkiGryPlay />} />
          <Route path="/ciekawostki-savoir-vivre" element={<CiekawostkiSavoirVivre/>}/>
          <Route path="/ciekawostki-kalendarium" element={<CiekawostkiKalendarium/>}/>
          <Route path="/sanatorium" element={<Sanatorium/>}/>
          <Route path="/sanatorium-cennik" element={<SanatoriumCennik/>}/>
          <Route path="/sanatorium-cenniki-pdfreader"  element={<CennikView/>}/>
          <Route path="/sanatorium-pokoje" element={<SanatoriumPokoje />} />
          <Route path="/sanatorium-pokoje/:floor" element={<SanatoriumPokojePietro />} />
          <Route path="/sanatorium-pokoje/:floor/:room" element={<SanatoriumPokojePietroPokoj />} />
          <Route path="/sanatorium-kuracjusze" element={<SanatoriumKuracjusze/>}/>
          <Route path="/sanatorium-personel" element={<SanatoriumPersonel/>}/>
          <Route path="/sanatorium-opinie" element={<SanatoriumOpinie/>}/>
          <Route path="/sanatorium-wyzywienie" element={<SanatoriumWyzywienie/>}/>
          <Route path="/sanatorium-zabiegi" element={<SanatoriumZabiegi/>}/>
          <Route path="/sanatorium-regulaminy" element={<SanatoriumRegulaminy/>}/>
          <Route path="/sanatorium-regulaminy-pdfreader"  element={<RegulaminView/>}/>
          <Route path="/pdf" element={<PdfView/>}/>
          <Route path="/gallery" element={<GalleryPage/>}/>
        </Routes>
      </ScreenSaverProvider>
    </div>
  )
}
