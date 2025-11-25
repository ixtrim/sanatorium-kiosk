type Props = {
  src: string
  title?: string
  className?: string
  query?: Record<string, string | number | undefined>
}
export default function GoogleFormEmbed({ src, title = 'Formularz', className, query }: Props) {
  const url = (() => {
    const u = new URL(src)
    if (query) for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) u.searchParams.set(k, String(v))
    }
    if (!u.searchParams.has('embedded')) u.searchParams.set('embedded', 'true')
    if (!u.searchParams.has('hl')) u.searchParams.set('hl', 'pl')
    return u.toString()
  })()

  return (
    <div className={`gform-embed ${className ?? ''}`}>
      <iframe
        title={title}
        src={url}
        sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        allow="clipboard-write"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}
