import { Link } from 'react-router-dom'
import cn from 'classnames'

type Props = {
  to: string
  title: string
  color?: 'green' | 'orange' | 'blue'
  className?: string
}

export default function MenuLinkCard({
  to, title, color='green', className,
}: Props) {
  return (
    <Link to={to} className={cn('menu-link', `menu-link--${color}`, className)}>
      <div className="menu-link__inner">
        <h3 className="menu-link__inner__title">{title}</h3>
      </div>
    </Link>
  )
}
