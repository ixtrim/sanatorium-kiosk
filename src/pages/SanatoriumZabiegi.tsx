import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'

type Item = { name: string; url: string }

export default function SanatoriumZabiegi() {
  const seconds = useIdleSecondsLeft(60_000)

  const base = `${import.meta.env.BASE_URL}media/zabiegi/`
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [imgOk, setImgOk] = useState(true)
  
  useEffect(() => {
    fetch(base + 'manifest.json', { cache: 'no-store' })
      .then(r => r.json())
      .then((files: string[]) => {
        const list = files.map(fn => ({
          url: base + fn,
          name: fn
            .replace(/\.[^.]+$/, '')
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        }))
        setItems(list)
        setIdx(0)
      })
      .catch(e => setError(e.message))
  }, [base])
  
  const item = items[idx]
  const canPrev = idx > 0
  const canNext = idx < items.length - 1
  
  useEffect(() => {
    if (!item) return
    const preload = (i: number) => {
      if (i >= 0 && i < items.length) {
        const im = new Image()
        im.src = items[i].url
      }
    }
    preload(idx + 1)
    preload(idx - 1)
  }, [idx, items, item])
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canPrev) setIdx(i => i - 1)
      if (e.key === 'ArrowRight' && canNext) setIdx(i => i + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canPrev, canNext])
  
  useEffect(() => { setImgOk(true) }, [idx])

  return (
    <div className="kiosk-container view-sanatorium-zabiegi">
      <TopBar />
      <ViewHeading title="Zabiegi" color="orange" />

      <section className="content-container">

        <div className="zabiegi-viewer">
          {error && <p>Błąd: {error}</p>}
          {!error && items.length === 0 && <p>Brak obrazów w katalogu „zabiegi”.</p>}

          {!error && item && (
            <>
              <h2 className="zabieg__title">{item.name}</h2>

              <figure className="zabieg__figure">
                {imgOk ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    loading="eager"
                    draggable={false}
                    onError={() => setImgOk(false)}
                  />
                ) : (
                  <div className="zabieg__img-error">Nie udało się załadować obrazu.</div>
                )}
              </figure>

              <div className="zabiegi-nav">
                <button className="kiosk-btn kiosk-btn--outline" onClick={() => canPrev && setIdx(i => i - 1)} disabled={!canPrev} >Wstecz</button>

                <div className="zabiegi-counter">
                  {idx + 1} / {items.length}
                </div>

                <button className="kiosk-btn kiosk-btn--outline" onClick={() => canNext && setIdx(i => i + 1)} disabled={!canNext} >Dalej</button>
              </div>
            </>
          )}
        </div>

      </section>

      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
