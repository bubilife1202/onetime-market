'use client'

import { useState, useEffect, useCallback } from 'react'
import ShippingModal from '@/components/seller/ShippingModal'
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
}

interface Order {
  id: string
  orderNumber: string
  status: string
  channel: string
  buyerName: string
  buyerPhone: string
  address: string
  addressDetail: string | null
  totalAmount: number
  trackingNumber: string | null
  trackingCarrier: string | null
  createdAt: string
  items: OrderItem[]
  round: Round
}

interface Stats {
  total: number
  paid: number
  shippingReady: number
  shipped: number
  delivered: number
}

export default function ShippingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, paid: 0, shippingReady: 0, shipped: 0, delivered: 0 })
  const [selectedRound, setSelectedRound] = useState<string>('')
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [modalOrder, setModalOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedRound) params.set('roundId', selectedRound)
    const res = await fetch(`/api/shipping?${params}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders)
      setRounds(data.rounds)
      setStats(data.stats)
    }
    setLoading(false)
  }, [selectedRound])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const shippable = orders.filter(o => o.status === 'PAID' || o.status === 'SHIPPING_READY')
      setSelectedOrders(new Set(shippable.map(o => o.id)))
    } else {
      setSelectedOrders(new Set())
    }
  }

  const handleSelectOne = (orderId: string, checked: boolean) => {
    const next = new Set(selectedOrders)
    if (checked) next.add(orderId)
    else next.delete(orderId)
    setSelectedOrders(next)
  }

  const handleBulkShip = async () => {
    if (selectedOrders.size === 0) return
    const carrier = 'CJ대한통운'
    const res = await fetch('/api/shipping/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderIds: Array.from(selectedOrders),
        carrier,
      }),
    })
    if (res.ok) {
      setSelectedOrders(new Set())
      fetchOrders()
    }
  }

  const handleTrackingSubmit = async (carrier: string, trackingNumber: string) => {
    if (!modalOrder) return
    await fetch(`/api/shipping/${modalOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrier, trackingNumber }),
    })
    fetchOrders()
  }

  const currentRound = rounds.find(r => r.id === selectedRound)
  const isClosedRound = currentRound?.status === 'CLOSED' || currentRound?.status === 'SETTLED'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">배송관리</h1>
        <select
          value={selectedRound}
          onChange={(e) => {
            setSelectedRound(e.target.value)
            setSelectedOrders(new Set())
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">전체 회차</option>
          {rounds.map((r) => (
            <option key={r.id} value={r.id}>
              제{r.roundNumber}회 {r.name} {r.status === 'CLOSED' ? '(마감)' : r.status === 'LIVE' ? '(진행중)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: '전체', value: stats.total, color: 'bg-gray-50' },
          { label: '결제완료', value: stats.paid, color: 'bg-blue-50' },
          { label: '배송준비', value: stats.shippingReady, color: 'bg-yellow-50' },
          { label: '발송완료', value: stats.shipped, color: 'bg-indigo-50' },
          { label: '배송완료', value: stats.delivered, color: 'bg-green-50' },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg ${s.color} p-4 text-center`}>
            <p className="text-sm text-gray-600">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Action */}
      {selectedOrders.size > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-indigo-50 p-4">
          <span className="text-sm font-medium text-indigo-700">
            {selectedOrders.size}건 선택됨
          </span>
          <button
            onClick={handleBulkShip}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            이 회차 전체 발송처리
          </button>
        </div>
      )}

      {isClosedRound && (
        <div className="rounded-lg bg-gray-100 p-3 text-center text-sm font-medium text-gray-600">
          마감회차 - 이 회차의 주문은 마감되었습니다
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={
                    selectedOrders.size > 0 &&
                    selectedOrders.size ===
                      orders.filter(o => o.status === 'PAID' || o.status === 'SHIPPING_READY').length
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">주문번호</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">상품</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">구매자</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">유입채널</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">배송지</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">송장</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  불러오는 중...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  배송 관리할 주문이 없습니다
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isClosed = order.round.status === 'CLOSED' || order.round.status === 'SETTLED'
                const canShip = order.status === 'PAID' || order.status === 'SHIPPING_READY'
                return (
                  <tr
                    key={order.id}
                    className={isClosed ? 'bg-gray-50' : ''}
                  >
                    <td className="px-4 py-3">
                      {canShip && (
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</div>
                      {isClosed && !selectedRound && (
                        <span className="mt-1 inline-block rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                          마감회차
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          {item.productName}
                          {item.option && <span className="text-gray-500"> ({item.option})</span>}
                          {' x'}{item.quantity}
                        </div>
                      ))}
                      <div className="text-xs font-medium text-gray-600">{formatPrice(order.totalAmount)}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="font-medium">{order.buyerName}</div>
                      <div className="text-xs text-gray-500">{order.buyerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <ChannelBadge channel={order.channel} />
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-sm text-gray-700">
                      <div className="truncate">{order.address}</div>
                      {order.addressDetail && (
                        <div className="truncate text-xs text-gray-500">{order.addressDetail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {order.trackingCarrier && (
                        <div>{order.trackingCarrier}</div>
                      )}
                      {order.trackingNumber && (
                        <div className="text-xs text-indigo-600">{order.trackingNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canShip && (
                        <button
                          onClick={() => setModalOrder(order)}
                          className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          송장입력
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Shipping Modal */}
      {modalOrder && (
        <ShippingModal
          isOpen={!!modalOrder}
          onClose={() => setModalOrder(null)}
          onSubmit={handleTrackingSubmit}
          orderNumber={modalOrder.orderNumber}
          buyerName={modalOrder.buyerName}
        />
      )}
    </div>
  )
}
