import { useEffect, useMemo, useRef } from 'react'

type Props = {
  title: string
  gameUrl: string
  onClose: () => void
}

export default function GameOverlay({ title, gameUrl, onClose }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    wrapRef.current?.requestFullscreen?.().catch(() => {})
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const compiledUrl = useMemo(() => {
    const file = gameUrl.split('/').pop() || ''
    const base = `${import.meta.env.BASE_URL}media/gry-built/`
    return base + file.replace(/\.jsx$/i, '.js')
  }, [gameUrl])

  const srcDoc = useMemo(() => {
    const react    = 'https://unpkg.com/react@18/umd/react.production.min.js'
    const reactDom = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'

    const styles = `
      html,body,#root{height:100%}
      body{margin:0;background:#001821;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
      #root{display:grid;place-items:center}
      .err{white-space:pre-wrap;padding:16px;font-size:14px;line-height:1.45}
      canvas,img,svg{max-width:100%;max-height:100%}
    `

    const mount = `
      (function(){
        try {
          var g = (typeof window !== 'undefined') ? window : self;
          var rootEl = document.getElementById('root');

          // UMD z babel-plugin-transform-modules-umd wystawia global 'Game'
          var Comp = g.Game && (g.Game.default || g.Game);
          if (!Comp) throw new Error('Nie znaleziono komponentu gry w window.Game');

          var el = g.React.createElement(Comp);
          g.ReactDOM.createRoot(rootEl).render(el);
        } catch (e) {
          var pre = document.createElement('pre'); pre.className='err';
          pre.textContent = 'Błąd uruchamiania gry:\\n\\n' + (e && (e.stack || e.message || String(e)));
          document.body.innerHTML = ''; document.body.appendChild(pre);
        }
      })();
    `

    return `
<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>${title}</title>
<style>${styles}</style>
</head>
<body>
  <div id="root"></div>
  <script src="${react}"></script>
  <script src="${reactDom}"></script>
  <script src="${compiledUrl}"></script>
  <script>${mount}</script>
</body>
</html>`
  }, [title, compiledUrl])

  const close = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen() } catch {}
    onClose()
  }

  return (
    <div ref={wrapRef} className="game-overlay">
      <button className="game-overlay__close" onClick={close} aria-label="Zamknij grę">✕ Zamknij</button>
      <iframe className="game-overlay__frame" srcDoc={srcDoc} sandbox="allow-scripts allow-same-origin" />
    </div>
  )
}
