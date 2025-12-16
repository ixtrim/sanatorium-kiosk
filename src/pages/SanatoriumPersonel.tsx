import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import { useGSheetRowsCsv } from '../hooks/useGSheetRowsCsv'
import TypewriterText from '../components/TypewriterText'

const FILE_ID = '1iIoeZYMJ6K0tGunOtGphW-Ud5K1S_d0VJO2ozB7YW7E'
const GID = '845445275'

export default function SanatoriumPersonel() {
  const seconds = useIdleSecondsLeft(60_000)

  const { rows, loading, error } = useGSheetRowsCsv(FILE_ID, GID)
  const [idx, setIdx] = useState(0)
  useEffect(() => { if (!loading) setIdx(0) }, [loading])

  const item = rows[idx]
  const canPrev = idx > 0
  const canNext = idx < rows.length - 1
  
  const [imgOk, setImgOk] = useState(true)
  useEffect(() => { setImgOk(true) }, [idx])

  return (
    <div className="kiosk-container">
      <TopBar />
      <div className="view-sanatorium-personel">
        <ViewHeading title="Personel" color="orange" />

        <section className="content-container">

          <div className="view-content">
            {loading && <p>Ładowanie…</p>}
            {error && <p>Błąd: {error}</p>}
            {!loading && !error && !item && <p>Brak treści do wyświetlenia.</p>}

            {!loading && !error && item && (
              <article className="row-article">
                {item.image && imgOk && (
                  <figure className="row-image">
                    <img
                      src={item.image}
                      alt=""
                      onError={() => setImgOk(false)}
                      loading="eager"
                      draggable={false}
                    />
                  </figure>
                )}

                {item.title && <h2 className="row-title">{item.title}</h2>}
                {item.content && <div className="row-text preline">
                  <TypewriterText
                    text={item.content ?? ''}
                    className="view-content-text preline"
                    speedMs={18}
                    startDelayMs={80}
                  />
                </div>}
              </article>
            )}
            
            {!loading && rows.length > 0 && (
              <div className="row-nav">
                <button className="kiosk-btn kiosk-btn--outline" onClick={() => canPrev && setIdx(i => Math.max(0, i - 1))} disabled={!canPrev} >
                  Wstecz
                </button>

                <div className="row-counter">
                  {rows.length > 0 ? `${idx + 1} / ${rows.length}` : '0 / 0'}
                </div>

                <button className="kiosk-btn kiosk-btn--outline" onClick={() => canNext && setIdx(i => Math.min(rows.length - 1, i + 1))}
                  disabled={!canNext} >
                  Dalej
                </button>
              </div>
            )}
          </div>

        </section>

      </div>
      
      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
