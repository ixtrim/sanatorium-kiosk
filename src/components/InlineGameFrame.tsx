import { useMemo } from 'react'

type Props = {
  title: string
  gameUrl: string
  onClose?: () => void
  height?: number | string
}

export default function InlineGameFrame({ title, gameUrl, height = '75vh' }: Props) {
  const srcDoc = useMemo(() => {
    const react    = 'https://unpkg.com/react@18/umd/react.production.min.js'
    const reactDom = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'

    const styles = `
      html,body,#root{height:100%; width: 100%; margin:0; padding:0; overflow:hidden}
      body{margin:0;background:#ffffff;color:#000;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
      #root{display:grid;place-items:center}
      .err{white-space:pre-wrap;padding:16px;font-size:14px;line-height:1.45}
      canvas,img,svg{max-width:100%;max-height:100%}
    `

    const mount = `
      (function(){
        try {
          var g = (typeof window !== 'undefined') ? window : self;
          var rootEl = document.getElementById('root');
          // UMD build exposes global 'Game'
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
  <script src="${gameUrl}"></script>
  <script>${mount}</script>
</body>
</html>`
  }, [title, gameUrl])

  return (
    <div className="inline-game">
      <iframe
        className="inline-game__frame"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin"
        style={{ width: '100%', height }}
      />
    </div>
  )
}
