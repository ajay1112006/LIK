import { useEffect, useRef } from 'react'

export default function Cursor3D() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY
    let raf = 0

    const animate = () => {
      currentX += (targetX - currentX) * 0.16
      currentY += (targetY - currentY) * 0.16
      dot.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`
      ring.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(animate)
    }

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY

      const mx = event.clientX / window.innerWidth - 0.5
      const my = event.clientY / window.innerHeight - 0.5
      document.documentElement.style.setProperty('--mx', String(mx))
      document.documentElement.style.setProperty('--my', String(my))
    }

    const onDown = () => {
      dot.classList.add('cursorDotActive')
      ring.classList.add('cursorRingActive')
    }

    const onUp = () => {
      dot.classList.remove('cursorDotActive')
      ring.classList.remove('cursorRingActive')
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursorRing" />
      <div ref={dotRef} className="cursorDot" />
    </>
  )
}
