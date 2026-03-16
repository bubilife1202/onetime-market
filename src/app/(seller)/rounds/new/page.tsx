'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRGenerator from '@/components/shared/QRGenerator'

interface ProductForm {
  name: string
  price: string
  originalPrice: string
  options: string
  stock: string
}

const emptyProduct: ProductForm = {
  name: '',
  price: '',
  originalPrice: '',
  options: '',
  stock: '100',
}

const refundTemplates: Record<string, string> = {
  '7DAY': '상품 수령 후 7일 이내 교환/환불 가능\n단순변심 반품 시 배송비 구매자 부담',
  '3DAY': '상품 수령 후 3일 이내 교환/환불 가능\n단순변심 반품 시 배송비 구매자 부담',
  NONE: '공동구매 특성상 교환/환불이 불가합니다\n상품 불량 시 교환 가능',
}

export default function NewRoundPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [createdRound, setCreatedRound] = useState<{ id: string; linkCode: string } | null>(null)

  // Step 1: Basic info
  const [name, setName] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [autoClose, setAutoClose] = useState(true)

  // Step 2: Products
  const [products, setProducts] = useState<ProductForm[]>([{ ...emptyProduct }])

  // Step 3: Trust settings
  const [refundPolicy, setRefundPolicy] = useState('7DAY')
  const [refundPolicyText, setRefundPolicyText] = useState(refundTemplates['7DAY'])

  const addProduct = () => setProducts([...products, { ...emptyProduct }])
  const removeProduct = (i: number) => setProducts(products.filter((_, idx) => idx !== i))
  const updateProduct = (i: number, field: keyof ProductForm, value: string) => {
    const updated = [...products]
    updated[i] = { ...updated[i], [field]: value }
    setProducts(updated)
  }

  const canNext = () => {
    if (step === 1) return name && startAt && endAt
    if (step === 2) return products.every((p) => p.name && p.price)
    if (step === 3) return true
    return true
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          startAt,
          endAt,
          autoClose,
          refundPolicy,
          refundPolicyText,
          products: products
            .filter((p) => p.name && p.price)
            .map((p) => ({
              name: p.name,
              price: parseInt(p.price),
              originalPrice: p.originalPrice ? parseInt(p.originalPrice) : undefined,
              options: p.options || undefined,
              stock: parseInt(p.stock) || 100,
            })),
        }),
      })
      const data = await res.json()
      setCreatedRound({ id: data.id, linkCode: data.linkCode })
      setStep(4)
    } catch (error) {
      console.error('Failed to create round:', error)
      alert('회차 생성에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const shareUrl = createdRound
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/m/${createdRound.linkCode}`
    : ''

  const steps = [
    { num: 1, label: '기본 정보' },
    { num: 2, label: '상품 등록' },
    { num: 3, label: '신뢰 설정' },
    { num: 4, label: '링크 생성' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">새 회차 만들기</h1>
        <p className="text-sm text-gray-500 mt-1">4단계로 판매 회차를 설정하세요</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s.num
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={`text-sm ${step >= s.num ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {s.num < 4 && <div className={`flex-1 h-px ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">회차 이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 3월 봄맞이 과일 공구"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">시작 일시 *</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">종료 일시 *</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAutoClose(!autoClose)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoClose ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoClose ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm text-gray-700">종료시간에 자동 마감</span>
          </div>
        </div>
      )}

      {/* Step 2: Products */}
      {step === 2 && (
        <div className="space-y-4">
          {products.map((product, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">상품 {i + 1}</h3>
                {products.length > 1 && (
                  <button
                    onClick={() => removeProduct(i)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">상품명 *</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => updateProduct(i, 'name', e.target.value)}
                  placeholder="예: 제주 감귤 3kg"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">판매가 *</label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => updateProduct(i, 'price', e.target.value)}
                    placeholder="15000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">원래가</label>
                  <input
                    type="number"
                    value={product.originalPrice}
                    onChange={(e) => updateProduct(i, 'originalPrice', e.target.value)}
                    placeholder="25000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">재고</label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => updateProduct(i, 'stock', e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">옵션 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={product.options}
                  onChange={(e) => updateProduct(i, 'options', e.target.value)}
                  placeholder="예: 3kg, 5kg, 10kg"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addProduct}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            + 상품 추가
          </button>
        </div>
      )}

      {/* Step 3: Trust Settings */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">환불 정책</label>
            <div className="space-y-2">
              {[
                { key: '7DAY', label: '7일 이내 교환/환불' },
                { key: '3DAY', label: '3일 이내 교환/환불' },
                { key: 'NONE', label: '교환/환불 불가' },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    refundPolicy === opt.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="refundPolicy"
                    value={opt.key}
                    checked={refundPolicy === opt.key}
                    onChange={(e) => {
                      setRefundPolicy(e.target.value)
                      setRefundPolicyText(refundTemplates[e.target.value])
                    }}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">환불 정책 상세</label>
            <textarea
              value={refundPolicyText}
              onChange={(e) => setRefundPolicyText(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 4: Link Generation */}
      {step === 4 && createdRound && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">회차가 생성되었습니다!</h2>
            <p className="text-sm text-gray-500">아래 링크를 공유하여 판매를 시작하세요</p>
          </div>

          {/* Share URL */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-xs text-gray-500 mb-2">공유 링크</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                복사
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <QRGenerator url={shareUrl} size={200} />
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`)}
              className="py-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
            >
              💬 카카오톡 공유
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="py-3 bg-pink-50 text-pink-800 rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors"
            >
              📸 인스타 링크 복사
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="py-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              🔗 링크 복사
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/rounds/${createdRound.id}`)}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              회차 상세 보기
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {step < 4 && (
        <div className="flex justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {step === 1 ? '취소' : '← 이전'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음 →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? '생성 중...' : '회차 생성하기'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
