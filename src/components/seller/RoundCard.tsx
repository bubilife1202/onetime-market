'use client'

import Link from 'next/link'
import { getStatusLabel, getStatusColor, formatDateTime } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface RoundCardProps {
  round: {
    id: string
    name: string
    roundNumber: number
    status: string
    startAt: string
    endAt: string
    isLive: boolean
    _count?: { orders: number; products: number }
  }
}

export default function RoundCard({ round }: RoundCardProps) {
  return (
    <Link
      href={`/rounds/${round.id}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">#{round.roundNumber}회차</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(round.status)}`}>
              {round.isLive && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1" />
              )}
              {getStatusLabel(round.status)}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900">{round.name}</h3>
        </div>
        {round.status === 'LIVE' && <CountdownTimer endAt={round.endAt} />}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{formatDateTime(round.startAt)} ~ {formatDateTime(round.endAt)}</span>
      </div>

      {round._count && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            상품 <strong className="text-gray-700">{round._count.products}</strong>개
          </span>
          <span className="text-xs text-gray-500">
            주문 <strong className="text-gray-700">{round._count.orders}</strong>건
          </span>
        </div>
      )}
    </Link>
  )
}
