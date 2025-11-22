import { Link } from 'react-router-dom'

export default function TopBar() {
  const logoUrl = `${import.meta.env.BASE_URL}media/brand/logo-orange.svg`; // działa też po deployu pod sub-URL

  return (
    <div className="topbar">
      <a href="/" className="brand" draggable={false}>
        <img
          src={logoUrl}
          alt="Sanatorium Kiosk — logo"
          className="brand__img"
          draggable={false}
        />
        <span className="brand__name">Sanatorium Kiosk</span>
      </a>
      <div className="text-xl opacity-70 select-none">10:15 · 14 WRZEŚNIA</div>
    </div>
  );
}
