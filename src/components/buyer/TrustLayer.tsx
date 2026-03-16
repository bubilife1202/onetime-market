'use client'

import { useState } from 'react'

interface TrustLayerProps {
  sellerName: string
  businessNumber?: string | null
  refundPolicy: string
  refundPolicyText?: string | null
}

const REFUND_LABELS: Record<string, string> = {
  '7DAY': '수령 후 7일 이내 환불 가능',
  '3DAY': '수령 후 3일 이내 환불 가능',
  NO_REFUND: '환불 불가 (주문 전 확인)',
  CUSTOM: '판매자 지정 환불규정',
}

export default function TrustLayer({
  sellerName,
  businessNumber,
  refundPolicy,
  refundPolicyText,
}: TrustLayerProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
          <span>✓ 인증된 판매자</span>
          <span className="text-emerald-400">·</span>
          <span>사업자등록 확인</span>
          <span className="text-emerald-400">·</span>
          <span>환불규정 공개</span>
        </div>
        <svg
          className={`w-4 h-4 text-emerald-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">👤</span>
            <span>판매자: {sellerName}</span>
          </div>
          {businessNumber && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">📋</span>
              <span>사업자번호: {businessNumber.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">🔄</span>
            <span>{REFUND_LABELS[refundPolicy] || refundPolicy}</span>
          </div>
          {refundPolicyText && (
            <div className="bg-white/60 rounded-lg p-3 text-xs text-emerald-700 whitespace-pre-wrap">
              {refundPolicyText}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
