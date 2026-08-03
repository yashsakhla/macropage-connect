import { useEffect, useRef } from 'react'

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  shape: 'rect' | 'circle'
}

const COLORS = ['#1a5c3a', '#ffd166', '#ef476f', '#3b82f6', '#a855f7', '#4ade80']

// Lightweight, dependency-free confetti burst — runs for a few seconds then
// unmounts itself. Used for the "greeting" ad category only.
export default function Confetti({ durationMs = 6000 }: { durationMs?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const onResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    const pieces: Piece[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * width,
      y: -20 - Math.random() * height * 0.5,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3.5,
      size: 5 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))

    let raf: number
    const start = performance.now()

    function draw(now: number) {
      const elapsed = now - start
      ctx!.clearRect(0, 0, width, height)

      const fadeOut = elapsed > durationMs - 600 ? Math.max(0, (durationMs - elapsed) / 600) : 1

      for (const p of pieces) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02
        p.rotation += p.rotationSpeed

        ctx!.save()
        ctx!.globalAlpha = fadeOut
        ctx!.translate(p.x, p.y)
        ctx!.rotate((p.rotation * Math.PI) / 180)
        ctx!.fillStyle = p.color
        if (p.shape === 'rect') {
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx!.beginPath()
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.restore()
      }

      if (elapsed < durationMs) {
        raf = requestAnimationFrame(draw)
      }
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [durationMs])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[110] pointer-events-none"
      aria-hidden="true"
    />
  )
}
