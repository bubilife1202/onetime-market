'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import StatsCard from '@/components/seller/StatsCard'
import ChannelChart from '@/components/seller/ChannelChart'
import OrderTable from '@/components/seller/OrderTable'
import CountdownTimer from '@/components/seller/CountdownTimer'
import { formatPrice, getStatusLabel, getStatusColor } from '@/lib/utils'

interface Round {
  id: string
  name: string
  roundNumber: number
  status: string
  startAt: string
  endAt: string
  isLive: boolean
  linkCode: string
  orders: {
    id: string
    orderNumber: string
    buyerName: string
    totalAmount: number
    status: string
    channel: string
    createdAt: string
    items: { productName: string; quantity: number }[]
  }[]
  _count: { orders: number; products: number }
}

interface Stats {
  totalOrders: number
  revenue: number
  pendingShipment: number
  conversionRate: number
  channels: { channel: string; count: number; percentage: number }[]
}

export default function DashboardPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const roundsRes = await fetch('/api/rounds')
      const roundsData = await roundsRes.json()
      setRounds(roundsData)

      // Get stats for the live round or the most recent round
      const liveRound = roundsData.find((r: Round) => r.status === 'LIVE')
      const targetRound = liveRound || roundsData[0]
      if (targetRound) {
        const statsRes = await fetch(`/api/rounds/${targetRound.id}/stats`)
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  const liveRound = rounds.find((r) => r.status === 'LIVE')
  const recentOrders = rounds
    .flatMap((r) => r.orders || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">실시간 판매 현황을 확인하세요</p>
        </div>
        <Link
          href="/rounds/new"
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 새 회차 만들기
        </Link>
      </div>

      {/* Live Round Hero */}
      {liveRound && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  LIVE
                </span>
                <span className="text-white/70 text-sm">#{liveRound.roundNumber}회차</span>
              </div>
              <h2 className="text-xl font-bold mb-1">{liveRound.name}</h2>
              <p className="text-white/70 text-sm">
                주문 {liveRound._count.orders}건 · 상품 {liveRound._count.products}개
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs mb-2">남은 시간</p>
              <CountdownTimer endAt={liveRound.endAt} size="lg" />
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            title="총 주문수"
            value={`${stats.totalOrders}건`}
            icon="📦"
            color="blue"
            change="실시간 갱신"
          />
          <StatsCard
            title="매출액"
            value={formatPrice(stats.revenue)}
            icon="💰"
            color="green"
          />
          <StatsCard
            title="미발송"
            value={`${stats.pendingShipment}건`}
            icon="🚚"
            color="orange"
          />
          <StatsCard
            title="전환율"
            value={`${stats.conversionRate}%`}
            icon="📈"
            color="purple"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Channel Analysis */}
        <div className="col-span-1">
          <ChannelChart data={stats?.channels || []} />
        </div>

        {/* Round Timeline */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">회차 타임라인</h3>
              <Link href="/rounds" className="text-xs text-blue-600 hover:underline">
                전체보기
              </Link>
            </div>
            <div className="space-y-3">
              {rounds.slice(0, 5).map((round) => (
                <Link
                  key={round.id}
                  href={`/rounds/${round.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      round.status === 'LIVE' ? 'bg-red-500 animate-pulse' :
                      round.status === 'CLOSED' ? 'bg-gray-300' :
                      'bg-blue-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {round.roundNumber}회차 · {round.name}
                      </p>
                      <p className="text-xs text-gray-400">주문 {round._count.orders}건</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(round.status)}`}>
                    {getStatusLabel(round.status)}
                  </span>
                </Link>
              ))}
              {rounds.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">아직 회차가 없습니다</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">최근 주문</h3>
          <Link href="/orders" className="text-xs text-blue-600 hover:underline">
            전체보기
          </Link>
        </div>
        <OrderTable orders={recentOrders} compact />
      </div>
    </div>
  )
}
