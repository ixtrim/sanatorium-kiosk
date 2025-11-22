import Gallery from '../components/Gallery'

export default function GalleryPage() {
  // Tymczasowe dane (później podmienimy na /api z Google Sheets)
  const items = [
    { src:'/media/foto1.jpg', w:1920, h:1080, thumb:'/media/foto1.jpg' },
    { src:'/media/foto2.jpg', w:1920, h:1080, thumb:'/media/foto2.jpg' },
  ]
  return <Gallery items={items}/>
}
