import { Link } from 'react-router-dom'
import cn from 'classnames'

type Props = {
  to: string
  title: string
  subtitle?: string
  color?: 'green' | 'orange' | 'blue'
  icon?: React.ReactNode
  className?: string
}

export default function MainLinkCard({
  to, title, subtitle, color='green', icon, className,
}: Props) {
  return (
    <Link to={to} className={cn('main-link', `main-link--${color}`, className)}>
      <div className="main-link__inner">
        <h3 className="main-link__inner__title">{title}</h3>
        {icon && <div className="main-link__inner__icon" aria-hidden>{icon}</div>}
        {subtitle && <p className="main-link__inner__subtitle">{subtitle}</p>}
      </div>
    </Link>
  )
}
