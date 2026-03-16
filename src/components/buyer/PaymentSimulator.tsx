'use client'

import { useState } from 'react'

interface PaymentSimulatorProps {
  totalAmount: number
  onComplete: () => void
  disabled?: boolean
}

const PAYMENT_METHODS = [
  { id: 'card', label: '신용/체크카드', icon: '💳' },
  { id: 'bank', label: '계좌이체', icon: '🏦' },
  { id: 'kakao', label: '카카오페이', icon: '💬' },
  { id: 'naver', label: '네이버페이', icon: '🟢' },
]

export default function PaymentSimulator({
  totalAmount,
  onComplete,
  disabled,
}: PaymentSimulatorProps) {
  const [selected, setSelected] = useState('card')
  const [processing, setProcessing] = useState(false)

  const handlePay = () => {
    if (disabled || processing) return
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      onComplete()
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">결제수단 선택</h3>

      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelected(method.id)}
            className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
              selected === method.id
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="text-lg">{method.icon}</span>
            <span>{method.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handlePay}
        disabled={disabled || processing}
        className="w-full bg-red-500 text-white rounded-xl py-4 text-lg font-bold hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            결제 처리 중...
          </span>
        ) : (
          `${totalAmount.toLocaleString('ko-KR')}원 결제하기`
        )}
      </button>
    </div>
  )
}
