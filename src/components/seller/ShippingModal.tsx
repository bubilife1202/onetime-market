'use client'

import { useState } from 'react'

interface ShippingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (carrier: string, trackingNumber: string) => void
  orderNumber: string
  buyerName: string
}

const CARRIERS = [
  { value: 'CJ대한통운', label: 'CJ대한통운' },
  { value: '한진택배', label: '한진택배' },
  { value: '롯데택배', label: '롯데택배' },
  { value: '우체국택배', label: '우체국택배' },
  { value: '로젠택배', label: '로젠택배' },
  { value: '경동택배', label: '경동택배' },
  { value: '대신택배', label: '대신택배' },
]

export default function ShippingModal({
  isOpen,
  onClose,
  onSubmit,
  orderNumber,
  buyerName,
}: ShippingModalProps) {
  const [carrier, setCarrier] = useState('CJ대한통운')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return
    setLoading(true)
    try {
      onSubmit(carrier, trackingNumber.trim())
      setTrackingNumber('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">송장번호 입력</h3>
        <p className="mt-1 text-sm text-gray-500">
          주문번호: {orderNumber} / 구매자: {buyerName}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">택배사</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CARRIERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">송장번호</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="송장번호를 입력하세요"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '처리중...' : '발송처리'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
