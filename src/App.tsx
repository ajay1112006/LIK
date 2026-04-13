import { useState } from 'react'
import logoPath from '@/components/ui/LIK_Title001.png'
import LoveScorePage from '@/components/LoveScorePage'
import Cursor3D from '@/components/ui/Cursor3D'

function App() {
  const [entered, setEntered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  function handleEnter() {
    if (isTransitioning) return
    setIsTransitioning(true)
    window.setTimeout(() => {
      setEntered(true)
      setIsTransitioning(false)
    }, 420)
  }

  if (entered) {
    return (
      <>
        <Cursor3D />
        <div className="pageEnter">
          <LoveScorePage />
        </div>
      </>
    )
  }

  return (
    <>
      <Cursor3D />
      <main className={`landingPage ${isTransitioning ? 'landingExit' : ''}`}>
        <div className="landingGlow landingGlowLeft" />
        <div className="landingGlow landingGlowRight" />

        <section className="logoWrap">
          <img
            src={logoPath}
            className="landingLogo tilt3d"
            alt="LIK Love Insurance Kompany logo"
          />
        </section>

        <section className="landingCopy">
          <button
            type="button"
            className="enterButton"
            onClick={handleEnter}
            disabled={isTransitioning}
          >
            Enter LIK
          </button>
        </section>
      </main>
    </>
  )
}

export default App
