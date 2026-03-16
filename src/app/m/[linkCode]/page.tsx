'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LiveBadge from '@/components/buyer/LiveBadge'
import TrustLayer from '@/components/buyer/TrustLayer'
import ProductCard from '@/components/buyer/ProductCard'
import MarketCloseBanner from '@/components/buyer/MarketCloseBanner'
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
  isLive: boolean
  linkCode: string
  startAt: string
  endAt: string
  refundPolicy: string
  refundPolicyText?: string | null
  seller: {
    id: string
    storeName: string
    ownerName: string
    businessNumber?: string | null
  }
  products: {
    id: string
    name: string
    price: number
    originalPrice?: number | null
    description?: string | null
    options?: { name: string; values: string[] }[] | null
    stock: number
    imageUrl?: string | null
    sortOrder: number
  }[]
}

export default function MarketPage() {
  const params = useParams()
  const router = useRouter()
  const linkCode = params.linkCode as string

  const [market, setMarket] = useState<MarketData | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    fetch(`/api/market/${linkCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('마켓을 찾을 수 없습니다')
        return res.json()
      })
      .then((data) => {
        setMarket(data)
        if (data.status === 'CLOSED') setExpired(true)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [linkCode])

  const handleAddToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const key = `${item.productId}-${item.option || ''}`
      const existing = prev.find(
        (c) => `${c.productId}-${c.option || ''}` === key
      )
      if (existing) {
        return prev.map((c) =>
          `${c.productId}-${c.option || ''}` === key
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        )
      }
      return [...prev, item]
    })
  }, [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">😢</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">마켓을 찾을 수 없습니다</h1>
          <p className="text-gray-500">링크가 만료되었거나 잘못된 주소입니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {market.isLive && !expired && <LiveBadge />}
          <span className="font-semibold text-gray-900">{market.seller.storeName}</span>
        </div>
      </div>

      {/* Round Info */}
      <div className="bg-white px-4 py-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">
          제{market.roundNumber}회 {market.name}
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Countdown Banner */}
        <MarketCloseBanner endAt={market.endAt} onExpired={() => setExpired(true)} />

        {/* Trust Layer */}
        <TrustLayer
          sellerName={market.seller.ownerName}
          businessNumber={market.seller.businessNumber}
          refundPolicy={market.refundPolicy}
          refundPolicyText={market.refundPolicyText}
        />

        {/* Products */}
        <div className="space-y-3">
          {market.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-sm text-gray-400">
          ⏰ 마감 후에는 주문조회만 가능합니다
        </div>
      </div>

      {/* Bottom Cart Bar */}
      {cartCount > 0 && !expired && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">{cartCount}개 상품</span>
              <span className="ml-2 font-bold text-gray-900">{formatPrice(cartTotal)}</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.setItem(`cart-${linkCode}`, JSON.stringify(cart))
                router.push(`/m/${linkCode}/checkout`)
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              주문하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
