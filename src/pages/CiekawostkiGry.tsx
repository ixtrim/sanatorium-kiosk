import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'

export default function CiekawostkiGry() {
  const seconds = useIdleSecondsLeft(60_000)

  return (
    <div className="kiosk-container">
      <TopBar />
      <div className="view-ciekawostki-czy-wiesz">
        <ViewHeading title="Gry" color="green" />
      </div>
      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
