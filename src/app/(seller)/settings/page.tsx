'use client'

import { useState, useEffect } from 'react'

interface SellerInfo {
  storeName: string
  ownerName: string
  businessNumber: string
  phone: string
}

export default function SettingsPage() {
  const [form, setForm] = useState<SellerInfo>({
    storeName: '',
    ownerName: '',
    businessNumber: '',
    phone: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchSeller = async () => {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        const s = data.seller
        setForm({
          storeName: s.storeName || '',
          ownerName: s.ownerName || '',
          businessNumber: s.businessNumber || '',
          phone: s.phone || '',
        })
      }
      setLoading(false)
    }
    fetchSeller()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setMessage({ type: 'success', text: '설정이 저장되었습니다' })
    } else {
      const data = await res.json()
      setMessage({ type: 'error', text: data.error || '저장에 실패했습니다' })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">설정</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">사업자 정보</h2>
        <p className="mt-1 text-sm text-gray-500">스토어와 사업자 정보를 관리합니다</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">스토어 이름</label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">대표자명</label>
            <input
              type="text"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">사업자등록번호</label>
            <input
              type="text"
              value={form.businessNumber}
              onChange={(e) => setForm({ ...form, businessNumber: e.target.value })}
              placeholder="000-00-00000"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">연락처</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </form>
      </div>
    </div>
  )
}
