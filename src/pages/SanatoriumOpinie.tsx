import TopBar from '../components/TopBar'
import BottomBackBar from '../components/BottomBackBar'
import ViewHeading from '../components/ViewHeading'
import { useIdleSecondsLeft } from '../hooks/useIdleSecondsLeft'
import GoogleFormEmbed from '../components/GoogleFormEmbed'

export default function SanatoriumOpinie() {
  // Give users more time to type (e.g., 3 minutes)
  const seconds = useIdleSecondsLeft(180_000)

  // Base Google Form URL
  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSexD2epP7vRHtlaqTVYQfxa06tmCtgVFTtRI7d3HRIycd9k-A/viewform'

  return (
    <div className="kiosk-container view-sanatorium-opinie">
      <TopBar />
      <ViewHeading title="Opinie" color="orange" />
      <section className="content-container-pdf-short">
        <GoogleFormEmbed
          src={FORM_URL}
          title="Opinie Sanatorium"
        />
      </section>
      <BottomBackBar secondsLeft={seconds} />
    </div>
  )
}
