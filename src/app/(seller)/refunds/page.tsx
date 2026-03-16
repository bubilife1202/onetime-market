'use client'

import { useState, useEffect, useCallback } from 'react'
import ChannelBadge from '@/components/shared/ChannelBadge'
import { formatPrice, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils'

interface OrderItem {
  id: string
  productName: string
  option: string | null
  quantity: number
  unitPrice: number
}

interface Round {
  id: string
  name: string
  roundNumber: number
  status: string
  refundPolicy?: string
  refundPolicyText?: string | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  channel: string
  buyerName: string
  buyerPhone: string
  buyerEmail: string | null
  totalAmount: number
  cancelReason: string | null
  refundReason: string | null
  policySnapshot: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  round: Round
}

interface Stats {
  total: number
  cancelRequested: number
  refundRequested: number
  processed: number
}

type TabKey = 'ALL' | 'CANCEL_REQUESTED' | 'REFUND_REQUESTED' | 'PROCESSED'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'CANCEL_REQUESTED', label: '취소요청' },
  { key: 'REFUND_REQUESTED', label: '환불요청' },
  { key: 'PROCESSED', label: '처리완료' },
]

export default function RefundsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, cancelRequested: 0, refundRequested: 0, processed: 0 })
  const [selectedRound, setSelectedRound] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedRound) params.set('roundId', selectedRound)
    const res = await fetch(`/api/refunds?${params}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders)
      setRounds(data.rounds)
      setStats(data.stats)
    }
    setLoading(false)
  }, [selectedRound])

  useEffect(() => {
    const load = async () => { await fetchOrders() }
    load()
  }, [fetchOrders])

  const handleAction = async (orderId: string, action: 'approve' | 'reject') => {
    setProcessing(true)
    const res = await fetch(`/api/refunds/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason: rejectReason || undefined }),
    })
    if (res.ok) {
      setDetailOrder(null)
      setRejectReason('')
      fetchOrders()
    }
    setProcessing(false)
  }

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'PROCESSED') return o.status === 'CANCELLED' || o.status === 'REFUNDED'
    return o.status === activeTab
  })

  const pendingCount = stats.cancelRequested + stats.refundRequested
  const currentRound = rounds.find(r => r.id === selectedRound)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">취소/환불 관리</h1>
        <select
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">전체 회차</option>
          {rounds.map((r) => (
            <option key={r.id} value={r.id}>
              제{r.roundNumber}회 {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Alert */}
      {pendingCount > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-800">
            {currentRound
              ? `제${currentRound.roundNumber}회 ${currentRound.name}에서 ${pendingCount}건의 처리 대기`
              : `전체 회차에서 ${pendingCount}건의 처리 대기`}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const count =
              tab.key === 'ALL' ? stats.total
              : tab.key === 'CANCEL_REQUESTED' ? stats.cancelRequested
              : tab.key === 'REFUND_REQUESTED' ? stats.refundRequested
              : stats.processed
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-gray-500">불러오는 중...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            {activeTab === 'ALL' ? '취소/환불 요청이 없습니다' : '해당하는 요청이 없습니다'}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
              onClick={() => setDetailOrder(order)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{order.orderNumber}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <ChannelBadge channel={order.channel} />
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {order.buyerName} · {formatPrice(order.totalAmount)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {order.items.map(i => i.productName).join(', ')}
                  </div>
                  {(order.cancelReason || order.refundReason) && (
                    <div className="mt-2 text-sm text-red-600">
                      사유: {order.cancelReason || order.refundReason}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>제{order.round.roundNumber}회</div>
                  <div>{formatDateTime(order.updatedAt)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {detailOrder.status === 'CANCEL_REQUESTED' ? '취소 요청 상세' : '환불 요청 상세'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  제{detailOrder.round.roundNumber}회 {detailOrder.round.name}
                </p>
              </div>
              <button
                onClick={() => { setDetailOrder(null); setRejectReason('') }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">주문번호</span>
                  <p className="font-medium">{detailOrder.orderNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500">구매자</span>
                  <p className="font-medium">{detailOrder.buyerName}</p>
                </div>
                <div>
                  <span className="text-gray-500">연락처</span>
                  <p className="font-medium">{detailOrder.buyerPhone}</p>
                </div>
                <div>
                  <span className="text-gray-500">결제금액</span>
                  <p className="font-medium">{formatPrice(detailOrder.totalAmount)}</p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">주문 상품</p>
                {detailOrder.items.map((item) => (
                  <div key={item.id} className="mt-1 text-sm">
                    {item.productName}
                    {item.option && ` (${item.option})`}
                    {' x'}{item.quantity} = {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                ))}
              </div>

              {(detailOrder.cancelReason || detailOrder.refundReason) && (
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs text-red-600">사유</p>
                  <p className="mt-1 text-sm text-red-700">
                    {detailOrder.cancelReason || detailOrder.refundReason}
                  </p>
                </div>
              )}

              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-600">회차 환불 정책</p>
                <p className="mt-1 text-sm text-blue-700">
                  {detailOrder.round.refundPolicy === '7DAY' ? '7일 이내 환불 가능' :
                   detailOrder.round.refundPolicy === '3DAY' ? '3일 이내 환불 가능' :
                   detailOrder.round.refundPolicy === 'NO_REFUND' ? '환불 불가' :
                   detailOrder.round.refundPolicyText || detailOrder.round.refundPolicy}
                </p>
              </div>

              {(detailOrder.status === 'CANCEL_REQUESTED' || detailOrder.status === 'REFUND_REQUESTED') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">거절 사유 (선택)</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="거절 시 사유를 입력하세요"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleAction(detailOrder.id, 'reject')}
                      disabled={processing}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      거절
                    </button>
                    <button
                      onClick={() => handleAction(detailOrder.id, 'approve')}
                      disabled={processing}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {detailOrder.status === 'CANCEL_REQUESTED' ? '취소 승인' : '환불 승인'}
                    </button>
                  </div>
                </>
              )}

              {(detailOrder.status === 'CANCELLED' || detailOrder.status === 'REFUNDED') && (
                <div className="rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-700">
                  처리 완료됨
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
