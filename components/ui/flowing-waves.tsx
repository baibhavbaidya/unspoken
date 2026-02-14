"use client"

import { useEffect, useRef } from "react"

export function FlowingWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener("resize", resize)

    const drawWave = (
      yOffset: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string,
      lineWidth: number
    ) => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      for (let x = -10; x <= width + 10; x += 1) {
        const normalizedX = x / width
        const y =
          height * yOffset +
          Math.sin(normalizedX * Math.PI * frequency + time * speed) *
            amplitude +
          Math.sin(normalizedX * Math.PI * frequency * 0.5 + time * speed * 0.7) *
            amplitude *
            0.5 +
          Math.cos(normalizedX * Math.PI * frequency * 0.3 + time * speed * 0.4) *
            amplitude *
            0.3

        if (x === -10) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      drawWave(0.2, 18, 2.2, 0.3, "rgba(3, 105, 161, 0.10)", 1.5)
      drawWave(0.28, 22, 1.8, 0.25, "rgba(14, 165, 233, 0.09)", 1.2)
      drawWave(0.38, 15, 2.6, 0.35, "rgba(3, 105, 161, 0.12)", 1.8)
      drawWave(0.46, 20, 2.0, 0.2, "rgba(14, 165, 233, 0.08)", 1.0)
      drawWave(0.55, 25, 1.5, 0.28, "rgba(3, 105, 161, 0.14)", 2.0)
      drawWave(0.64, 18, 2.4, 0.32, "rgba(14, 165, 233, 0.10)", 1.4)
      drawWave(0.73, 22, 1.9, 0.22, "rgba(3, 105, 161, 0.09)", 1.6)
      drawWave(0.82, 16, 2.8, 0.3, "rgba(14, 165, 233, 0.07)", 1.2)
      drawWave(0.9, 20, 2.1, 0.26, "rgba(3, 105, 161, 0.06)", 1.0)

      time += 0.008
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
