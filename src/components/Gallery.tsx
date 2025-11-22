import { useEffect, useRef } from 'react'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'

export type GalleryItem = { src:string; w:number; h:number; thumb?:string; title?:string }

export default function Gallery({items}:{items:GalleryItem[]}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const lb = new PhotoSwipeLightbox({
      gallery: ref.current,
      children: 'a',
      pswpModule: () => import('photoswipe'),
      wheelToZoom: true,
      bgOpacity: 0.9,
      paddingFn: () => ({ top:20, bottom:20, left:20, right:20 }),
    })
    lb.init()
    return () => lb.destroy()
  }, [])

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {items.map((it, i)=>(
        <a key={i}
           href={it.src}
           data-pswp-width={it.w}
           data-pswp-height={it.h}
           className="block rounded-2xl overflow-hidden focus:outline-none focus:ring-4">
          <img
            src={it.thumb ?? it.src}
            alt={it.title ?? `Zdjęcie ${i+1}`}
            className="w-full h-48 object-cover"
            loading="lazy"
            draggable={false}
          />
        </a>
      ))}
    </div>
  )
}
