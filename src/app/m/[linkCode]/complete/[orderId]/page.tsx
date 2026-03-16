'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface OrderData {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  shippingFee: number
  buyerName: string
  createdAt: string
  items: {
    id: string
    productName: string
    option?: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  round: {
    name: string
    roundNumber: number
    linkCode: string
    seller: { storeName: string }
  }
}

export default function OrderCompletePage() {
  const params = useParams()
  const router = useRouter()
  const linkCode = params.linkCode as string
  const orderId = params.orderId as string

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [orderId])

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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b">
        <h1 className="font-bold text-gray-900 text-center">주문 완료</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Success */}
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            주문이 완료되었습니다!
          </h2>
          <p className="text-gray-500 text-sm">
            {order.buyerName}님, 감사합니다
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-gray-900">주문 정보</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">주문번호</span>
              <span className="font-mono font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">주문일시</span>
              <span>{new Date(order.createdAt).toLocaleString('ko-KR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">결제금액</span>
              <span className="font-bold text-red-500">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">예상 배송</span>
              <span>결제일 기준 3~5일 이내</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl p-4 space-y-2">
          <h3 className="font-bold text-gray-900">주문 상품</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <div>
                <span className="text-gray-900">{item.productName}</span>
                {item.option && (
                  <span className="text-gray-400 ml-1">({item.option})</span>
                )}
                <span className="text-gray-400 ml-1">× {item.quantity}</span>
              </div>
              <span className="font-medium">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          <p className="font-medium mb-1">📌 안내사항</p>
          <p>마켓 마감 후에도 이 페이지에서 주문 조회가 가능합니다.</p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/m/${linkCode}/order/${order.id}`)}
            className="w-full bg-red-500 text-white rounded-xl py-3 font-bold hover:bg-red-600 transition-colors"
          >
            주문 조회하기
          </button>
          <button
            onClick={() => router.push(`/m/${linkCode}`)}
            className="w-full bg-white border text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition-colors"
          >
            마켓으로 돌아가기
          </button>
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}
