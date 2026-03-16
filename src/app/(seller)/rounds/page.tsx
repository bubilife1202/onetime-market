'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import RoundCard from '@/components/seller/RoundCard'

interface Round {
  id: string
  name: string
  roundNumber: number
  status: string
  startAt: string
  endAt: string
  isLive: boolean
  _count: { orders: number; products: number }
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rounds')
      .then((res) => res.json())
      .then((data) => setRounds(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? rounds : rounds.filter((r) => r.status === filter)

  const filters = [
    { key: 'ALL', label: '전체' },
    { key: 'LIVE', label: '라이브' },
    { key: 'SCHEDULED', label: '예정' },
    { key: 'CLOSED', label: '마감' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회차 관리</h1>
          <p className="text-sm text-gray-500 mt-1">판매 회차를 생성하고 관리하세요</p>
        </div>
        <Link
          href="/rounds/new"
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 새 회차 만들기
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
            {f.key !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-60">
                {rounds.filter((r) => r.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Round Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400 mb-4">
            {filter === 'ALL' ? '아직 회차가 없습니다' : '해당 상태의 회차가 없습니다'}
          </p>
          {filter === 'ALL' && (
            <Link
              href="/rounds/new"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              첫 회차 만들기 →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
