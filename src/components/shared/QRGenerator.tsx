'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRGeneratorProps {
  url: string
  size?: number
}

export default function QRGenerator({ url, size = 200 }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      })
    }
  }, [url, size])

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} />
      <p className="text-xs text-gray-500 break-all max-w-[250px] text-center">{url}</p>
    </div>
  )
}
