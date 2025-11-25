import cn from 'classnames'

type Props = {
  title: string
  color?: 'green' | 'orange' | 'blue'
  className?: string
}

export default function MenuLinkCard({
  title, color='green', className,
}: Props) {
  return (
    <header className={cn('view-heading', `view-heading--${color}`, className)}>
      <h3 className="view-heading__title">{title}</h3>
    </header>
  )
}
