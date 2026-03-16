'use client'

import { useState, useEffect } from 'react'
import { getRemainingTime } from '@/lib/utils'

interface CountdownTimerProps {
  endAt: string | Date
  size?: 'sm' | 'lg'
}

export default function CountdownTimer({ endAt, size = 'sm' }: CountdownTimerProps) {
  const [time, setTime] = useState(getRemainingTime(endAt))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getRemainingTime(endAt))
    }, 1000)
    return () => clearInterval(timer)
  }, [endAt])

  if (time.expired) {
    return <span className="text-gray-400 text-sm">마감됨</span>
  }

  const totalMinutes = time.hours * 60 + time.minutes
  const isUrgent = totalMinutes < 30

  const pad = (n: number) => String(n).padStart(2, '0')

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-2 font-mono text-3xl font-bold ${isUrgent ? 'text-red-500' : 'text-gray-900'}`}>
        <div className="flex flex-col items-center">
          <span>{pad(time.hours)}</span>
          <span className="text-[10px] font-normal text-gray-400">시간</span>
        </div>
        <span className={isUrgent ? 'animate-pulse' : ''}>:</span>
        <div className="flex flex-col items-center">
          <span>{pad(time.minutes)}</span>
          <span className="text-[10px] font-normal text-gray-400">분</span>
        </div>
        <span className={isUrgent ? 'animate-pulse' : ''}>:</span>
        <div className="flex flex-col items-center">
          <span>{pad(time.seconds)}</span>
          <span className="text-[10px] font-normal text-gray-400">초</span>
        </div>
      </div>
    )
  }

  return (
    <span className={`font-mono text-sm font-medium ${isUrgent ? 'text-red-500' : 'text-gray-700'}`}>
      {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
    </span>
  )
}
