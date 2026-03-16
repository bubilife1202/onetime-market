'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice, formatDateTime, getStatusLabel, getStatusColor, getDiscountPercent } from '@/lib/utils'
import StatsCard from '@/components/seller/StatsCard'
import CountdownTimer from '@/components/seller/CountdownTimer'
import ChannelChart from '@/components/seller/ChannelChart'
import OrderTable from '@/components/seller/OrderTable'
import QRGenerator from '@/components/shared/QRGenerator'

interface Product {
  id: string
  name: string
  price: number
  originalPrice: number | null
  options: string | null
  stock: number
}

interface Order {
  id: string
  orderNumber: string
  buyerName: string
  totalAmount: number
  status: string
  channel: string
  createdAt: string
  items: { productName: string; quantity: number }[]
}

interface Round {
  id: string
  name: string
  roundNumber: number
  status: string
  linkCode: string
  startAt: string
  endAt: string
  isLive: boolean
  autoClose: boolean
  refundPolicy: string
  refundPolicyText: string | null
  products: Product[]
  orders: Order[]
  _count: { orders: number; products: number }
}

interface Stats {
  totalOrders: number
  revenue: number
  pendingShipment: number
  conversionRate: number
  channels: { channel: string; count: number; percentage: number }[]
}

export default function RoundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [round, setRound] = useState<Round | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [closing, setClosing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [roundRes, statsRes] = await Promise.all([
        fetch(`/api/rounds/${id}`),
        fetch(`/api/rounds/${id}/stats`),
      ])
      const roundData = await roundRes.json()
      const statsData = await statsRes.json()
      setRound(roundData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch round data:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleClose = async () => {
    if (!confirm('정말로 이 회차를 마감하시겠습니까?')) return
    setClosing(true)
    try {
      await fetch(`/api/rounds/${id}/close`, { method: 'POST' })
      fetchData()
    } catch (error) {
      console.error('Failed to close round:', error)
    } finally {
      setClosing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 회차를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
      await fetch(`/api/rounds/${id}`, { method: 'DELETE' })
      router.push('/rounds')
    } catch (error) {
      console.error('Failed to delete round:', error)
    }
  }

  if (loading || !round) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/m/${round.linkCode}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/rounds')}
            className="text-sm text-gray-400 hover:text-gray-600 mb-1"
          >
            ← 회차 목록
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              #{round.roundNumber} {round.name}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(round.status)}`}>
              {round.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              {getStatusLabel(round.status)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formatDateTime(round.startAt)} ~ {formatDateTime(round.endAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            QR 코드
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            링크 복사
          </button>
          {round.status === 'LIVE' && (
            <button
              onClick={handleClose}
              disabled={closing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {closing ? '마감 중...' : '회차 마감'}
            </button>
          )}
          {round.status !== 'LIVE' && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <QRGenerator url={shareUrl} size={250} />
          <button
            onClick={() => setShowQR(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            닫기
          </button>
        </div>
      )}

      {/* Live countdown */}
      {round.status === 'LIVE' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-sm text-white/80">라이브 판매 중</span>
            </div>
            <p className="text-white/70 text-sm">주문 {round._count.orders}건 진행 중</p>
          </div>
          <CountdownTimer endAt={round.endAt} size="lg" />
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatsCard title="총 주문수" value={`${stats.totalOrders}건`} icon="📦" color="blue" />
          <StatsCard title="매출액" value={formatPrice(stats.revenue)} icon="💰" color="green" />
          <StatsCard title="미발송" value={`${stats.pendingShipment}건`} icon="🚚" color="orange" />
          <StatsCard title="전환율" value={`${stats.conversionRate}%`} icon="📈" color="purple" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Channel Chart */}
        <div className="col-span-1">
          <ChannelChart data={stats?.channels || []} />
        </div>

        {/* Products */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">등록 상품 ({round.products.length})</h3>
            <div className="space-y-3">
              {round.products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    {product.options && (
                      <p className="text-xs text-gray-400 mt-0.5">옵션: {product.options}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-xs text-gray-400">
                        <span className="line-through">{formatPrice(product.originalPrice)}</span>
                        <span className="text-red-500 ml-1">
                          {getDiscountPercent(product.originalPrice, product.price)}%
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400">재고 {product.stock}개</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">주문 목록 ({round.orders.length})</h3>
        <OrderTable orders={round.orders} />
      </div>
    </div>
  )
}
