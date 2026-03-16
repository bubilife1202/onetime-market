'use client'

import { useState } from 'react'
import { formatPrice, getDiscountPercent } from '@/lib/utils'

interface ProductOption {
  name: string
  values: string[]
}

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number | null
    description?: string | null
    options?: ProductOption[] | null
    stock: number
    imageUrl?: string | null
  }
  onAddToCart: (item: {
    productId: string
    name: string
    price: number
    option: string | null
    quantity: number
  }) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const discount = getDiscountPercent(product.originalPrice || 0, product.price)
  const soldOut = product.stock <= 0

  const handleAdd = () => {
    if (soldOut) return
    if (product.options?.length && !selectedOption) return
    onAddToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      option: selectedOption || null,
      quantity,
    })
    setQuantity(1)
    setSelectedOption('')
  }

  return (
    <div className={`bg-white rounded-xl border p-4 ${soldOut ? 'opacity-50' : ''}`}>
      {product.imageUrl && (
        <div className="w-full h-40 rounded-lg bg-gray-100 mb-3 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-gray-900">{product.name}</h3>
        {soldOut && (
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            품절
          </span>
        )}
      </div>

      {product.description && (
        <p className="text-sm text-gray-500 mb-2">{product.description}</p>
      )}

      <div className="flex items-baseline gap-2 mb-3">
        {discount > 0 && (
          <>
            <span className="text-red-500 font-bold text-lg">{discount}%</span>
            <span className="text-gray-400 line-through text-sm">
              {formatPrice(product.originalPrice!)}
            </span>
          </>
        )}
        <span className="font-bold text-lg text-gray-900">
          {formatPrice(product.price)}
        </span>
      </div>

      {product.options?.map((opt) => (
        <div key={opt.name} className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">{opt.name}</label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            disabled={soldOut}
          >
            <option value="">선택해주세요</option>
            {opt.values.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
            disabled={soldOut}
          >
            −
          </button>
          <span className="px-3 py-2 text-sm font-medium min-w-[2rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
            disabled={soldOut}
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={soldOut || (!!product.options?.length && !selectedOption)}
          className="flex-1 bg-red-500 text-white rounded-lg py-2 px-4 text-sm font-semibold hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
        >
          {soldOut ? '품절' : '담기'}
        </button>
      </div>
    </div>
  )
}
