'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatPrice, getStatusLabel, getStatusColor } from '@/lib/utils'

interface OrderData {
  id: string
  orderNumber: string
  status: string
  channel: string
  buyerName: string
  buyerPhone: string
  address: string
  addressDetail?: string | null
  zipCode?: string | null
  deliveryMemo?: string | null
  totalAmount: number
  shippingFee: number
  trackingNumber?: string | null
  trackingCarrier?: string | null
  cancelReason?: string | null
  createdAt: string
  updatedAt: string
  items: {
    id: string
    productName: string
    option?: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
    product: { imageUrl?: string | null }
  }[]
  round: {
    name: string
    roundNumber: number
    linkCode: string
    seller: { storeName: string; phone?: string | null }
  }
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const linkCode = params.linkCode as string
  const orderId = params.orderId as string

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)

  const fetchOrder = () => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then(setOrder)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const handleCancel = async () => {
    if (!cancelReason.trim()) return
    setCancelling(true)
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelReason }),
    })
    if (res.ok) {
      setShowCancelForm(false)
      setCancelReason('')
      fetchOrder()
    }
    setCancelling(false)
  }

  const canCancel = order && ['PAID', 'SHIPPING_READY'].includes(order.status)

  const STATUS_STEPS = ['PAID', 'SHIPPING_READY', 'SHIPPED', 'DELIVERED']
  const STATUS_STEP_LABELS: Record<string, string> = {
    PAID: '결제완료',
    SHIPPING_READY: '배송준비',
    SHIPPED: '배송중',
    DELIVERED: '배송완료',
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-500">주문 정보를 찾을 수 없습니다</p>
      </div>
    )
  }

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const isCancelledFlow = ['CANCEL_REQUESTED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUNDED'].includes(order.status)

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/m/${linkCode}`)} className="text-gray-600">
            ← 마켓
          </button>
          <h1 className="font-bold text-gray-900">주문 조회</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Badge */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">주문번호 {order.orderNumber}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>

          {/* Progress Steps */}
          {!isCancelledFlow && (
            <div className="flex items-center justify-between mt-4">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= currentStep
                const isCurrent = i === currentStep
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div
                        className={`absolute top-3 -left-1/2 w-full h-0.5 ${
                          i <= currentStep ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-red-500 text-white ring-4 ring-red-100'
                          : isActive
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isActive ? '✓' : i + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        isActive ? 'text-red-600 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {STATUS_STEP_LABELS[step]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {isCancelledFlow && (
            <div className="bg-red-50 rounded-lg p-3 mt-2 text-sm text-red-700">
              {order.cancelReason && <p>사유: {order.cancelReason}</p>}
            </div>
          )}
        </div>

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-2">배송 추적</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">택배사</span>
                <span>{order.trackingCarrier || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">운송장번호</span>
                <span className="font-mono">{order.trackingNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-3">주문 상품</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                {item.product.imageUrl && (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img src={item.product.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  {item.option && <p className="text-xs text-gray-500">{item.option}</p>}
                  <p className="text-xs text-gray-500">수량: {item.quantity}</p>
                  <p className="text-sm font-semibold mt-1">{formatPrice(item.totalPrice)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>배송비</span>
              <span>{order.shippingFee === 0 ? '무료' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>총 결제금액</span>
              <span className="text-red-500">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-xl p-4 text-sm space-y-2">
          <h3 className="font-bold text-gray-900">배송 정보</h3>
          <p>{order.buyerName} · {order.buyerPhone}</p>
          <p className="text-gray-600">
            {order.zipCode && `(${order.zipCode}) `}
            {order.address}
            {order.addressDetail && ` ${order.addressDetail}`}
          </p>
          {order.deliveryMemo && (
            <p className="text-gray-500">메모: {order.deliveryMemo}</p>
          )}
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-xl p-4 text-sm space-y-1">
          <h3 className="font-bold text-gray-900">판매자 정보</h3>
          <p>{order.round.seller.storeName}</p>
          {order.round.seller.phone && (
            <p className="text-gray-500">연락처: {order.round.seller.phone}</p>
          )}
        </div>

        {/* Cancel */}
        {canCancel && !showCancelForm && (
          <button
            onClick={() => setShowCancelForm(true)}
            className="w-full bg-white border border-red-200 text-red-500 rounded-xl py-3 font-medium hover:bg-red-50 transition-colors"
          >
            주문 취소 요청
          </button>
        )}

        {showCancelForm && (
          <div className="bg-white rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-gray-900">취소 사유</h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="취소 사유를 입력해주세요"
              className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none h-24"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelForm(false)}
                className="flex-1 border rounded-xl py-2.5 text-sm font-medium text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelling}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-600 disabled:bg-gray-300 transition-colors"
              >
                {cancelling ? '처리 중...' : '취소 요청'}
              </button>
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  )
}
