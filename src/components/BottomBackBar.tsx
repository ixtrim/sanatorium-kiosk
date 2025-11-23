import { useNavigate, Link } from 'react-router-dom'

type Props = {
  backTo?: string
  secondsLeft?: number
  totalSeconds?: number
  className?: string
}

export default function BottomBackBar({
  backTo,
  secondsLeft,
  totalSeconds = 60,
  className,
}: Props) {
  const nav = useNavigate()

  // URLs to your public icons
  const backIconUrl  = `${import.meta.env.BASE_URL}media/icons/icon_black_arrow-left.svg`;
  const clockIconUrl = `${import.meta.env.BASE_URL}media/icons/icon_black_clock.svg`;

  const BackInner = (
    <>
      <span className="bottom-back-bar__back__icon" aria-hidden>
        <img
          src={backIconUrl}
          alt=""
          width={45}
          height={45}
          className="bottom-back-bar__icon-img"
          draggable={false}
        />
      </span>
      <span className="bottom-back-bar__back__label">POWRÓT</span>
    </>
  )

  return (
    <div className={`bottom-back-bar ${className ?? ''}`} role="contentinfo">
      {backTo ? (
        <Link to={backTo} className="bottom-back-bar__back" draggable={false} aria-label="Powrót">
          {BackInner}
        </Link>
      ) : (
        <button type="button" className="bottom-back-bar__back" onClick={() => nav(-1)} aria-label="Powrót">
          {BackInner}
        </button>
      )}

      <div className="bottom-back-bar__auto" aria-label="Automatyczny powrót">
        <span className="bottom-back-bar__auto__icon" aria-hidden>
          <img
            src={clockIconUrl}
            alt=""
            width={45}
            height={45}
            className="bottom-back-bar__icon-img"
            draggable={false}
          />
        </span>
        <span className="bottom-back-bar__auto__text">
          Automatyczny powrót<br/>po {secondsLeft ?? totalSeconds} sek.
        </span>
      </div>
    </div>
  )
}
