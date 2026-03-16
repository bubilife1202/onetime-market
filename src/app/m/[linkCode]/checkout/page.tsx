'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PaymentSimulator from '@/components/buyer/PaymentSimulator'
import { formatPrice } from '@/lib/utils'

interface CartItem {
  productId: string
  name: string
  price: number
  option: string | null
  quantity: number
}

interface MarketData {
  id: string
  name: string
  roundNumber: number
  status: string
  endAt: string
  refundPolicy: string
  refundPolicyText?: string | null
  seller: { storeName: string }
}

const REFUND_LABELS: Record<string, string> = {
  '7DAY': '수령 후 7일 이내 환불 가능',
  '3DAY': '수령 후 3일 이내 환불 가능',
  NO_REFUND: '환불 불가 (주문 전 확인)',
  CUSTOM: '판매자 지정 환불규정',
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const linkCode = params.linkCode as string

  const [cart, setCart] = useState<CartItem[]>([])
  const [market, setMarket] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [policyAgreed, setPolicyAgreed] = useState(false)

  const [form, setForm] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    deliveryMemo: '',
  })

  useEffect(() => {
    const init = async () => {
      const stored = sessionStorage.getItem(`cart-${linkCode}`)
      if (!stored) {
        router.replace(`/m/${linkCode}`)
        return
      }
      setCart(JSON.parse(stored))

      const res = await fetch(`/api/market/${linkCode}`)
      const data = await res.json()
      setMarket(data)
      setLoading(false)
    }
    init()
  }, [linkCode, router])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = subtotal >= 50000 ? 0 : 3000
  const total = subtotal + shippingFee

  const isFormValid =
    form.buyerName && form.buyerPhone && form.address && policyAgreed

  const handlePaymentComplete = async () => {
    const searchParams = new URLSearchParams(window.location.search)
    const ch = searchParams.get('ch')

    const res = await fetch(`/api/orders${ch ? `?ch=${ch}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roundId: market!.id,
        buyerName: form.buyerName,
        buyerPhone: form.buyerPhone,
        buyerEmail: form.buyerEmail || undefined,
        address: form.address,
        addressDetail: form.addressDetail || undefined,
        zipCode: form.zipCode || undefined,
        deliveryMemo: form.deliveryMemo || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          option: item.option,
          quantity: item.quantity,
        })),
      }),
    })

    if (res.ok) {
      const order = await res.json()
      sessionStorage.removeItem(`cart-${linkCode}`)
      router.push(`/m/${linkCode}/complete/${order.id}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600">
            ← 뒤로
          </button>
          <h1 className="font-bold text-gray-900">주문/결제</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Round Context */}
        {market && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
            이 주문은 <strong>제{market.roundNumber}회 {market.name}</strong> 회차에서
            발생했습니다
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-bold text-gray-900">주문 상품</h2>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.option && (
                  <p className="text-gray-500 text-xs">{item.option}</p>
                )}
                <p className="text-gray-500 text-xs">수량: {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="border-t pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>상품금액</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>배송비</span>
              <span>{shippingFee === 0 ? '무료' : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
              <span>총 결제금액</span>
              <span className="text-red-500">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Form */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-bold text-gray-900">배송 정보</h2>
          <input
            type="text"
            placeholder="이름 *"
            value={form.buyerName}
            onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />
          <input
            type="tel"
            placeholder="연락처 * (예: 010-1234-5678)"
            value={form.buyerPhone}
            onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />
          <input
            type="email"
            placeholder="이메일 (선택)"
            value={form.buyerEmail}
            onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="우편번호"
            value={form.zipCode}
            onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="주소 *"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="상세주소"
            value={form.addressDetail}
            onChange={(e) => setForm({ ...form, addressDetail: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="배송 메모 (예: 부재 시 문앞)"
            value={form.deliveryMemo}
            onChange={(e) => setForm({ ...form, deliveryMemo: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />
        </div>

        {/* Refund Policy Agreement */}
        {market && (
          <div className="bg-white rounded-xl p-4">
            <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">환불규정</p>
              <p>{REFUND_LABELS[market.refundPolicy] || market.refundPolicy}</p>
              {market.refundPolicyText && (
                <p className="mt-1 text-xs whitespace-pre-wrap">{market.refundPolicyText}</p>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={policyAgreed}
                onChange={(e) => setPolicyAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                환불규정을 확인했으며 동의합니다
              </span>
            </label>
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-xl p-4">
          <PaymentSimulator
            totalAmount={total}
            onComplete={handlePaymentComplete}
            disabled={!isFormValid}
          />
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}
