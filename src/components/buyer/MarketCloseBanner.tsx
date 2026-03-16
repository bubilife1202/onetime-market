'use client'

import { useEffect, useState } from 'react'
import { getRemainingTime } from '@/lib/utils'

interface MarketCloseBannerProps {
  endAt: string
  onExpired?: () => void
}

export default function MarketCloseBanner({ endAt, onExpired }: MarketCloseBannerProps) {
  const [remaining, setRemaining] = useState(getRemainingTime(endAt))

  useEffect(() => {
    const timer = setInterval(() => {
      const r = getRemainingTime(endAt)
      setRemaining(r)
      if (r.expired) {
        clearInterval(timer)
        onExpired?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [endAt, onExpired])

  if (remaining.expired) {
    return (
      <div className="bg-gray-800 text-white rounded-xl p-4 text-center">
        <p className="text-lg font-bold">마켓이 마감되었습니다</p>
        <p className="text-sm text-gray-300 mt-1">주문조회만 가능합니다</p>
      </div>
    )
  }

  const totalSeconds = remaining.hours * 3600 + remaining.minutes * 60 + remaining.seconds
  const isUrgent = totalSeconds < 3600

  return (
    <div
      className={`rounded-xl p-4 text-white text-center ${
        isUrgent
          ? 'bg-gradient-to-r from-red-600 to-orange-500'
          : 'bg-gradient-to-r from-red-500 to-orange-400'
      }`}
    >
      <p className="text-sm font-medium mb-1">
        {isUrgent ? '⏰ 마감 임박!' : '⏰ 이 마켓은 곧 마감됩니다'}
      </p>
      <div className="flex items-center justify-center gap-1 text-2xl font-bold tabular-nums">
        {remaining.hours > 0 && (
          <>
            <span>{String(remaining.hours).padStart(2, '0')}</span>
            <span className="text-white/70">:</span>
          </>
        )}
        <span>{String(remaining.minutes).padStart(2, '0')}</span>
        <span className="text-white/70">:</span>
        <span>{String(remaining.seconds).padStart(2, '0')}</span>
      </div>
      <p className="text-xs text-white/80 mt-1">마감 후에는 주문이 불가합니다</p>
    </div>
  )
}
