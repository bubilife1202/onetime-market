'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    storeName: '',
    ownerName: '',
    businessNumber: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다.')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('서버와 연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🏪 일회용마켓
          </h1>
          <p className="mt-2 text-gray-500">판매자 회원가입</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              placeholder="seller@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              placeholder="6자 이상 입력"
            />
          </div>

          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
              상점명 <span className="text-red-500">*</span>
            </label>
            <input
              id="storeName"
              type="text"
              value={form.storeName}
              onChange={(e) => updateField('storeName', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              placeholder="상점명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
              대표자명 <span className="text-red-500">*</span>
            </label>
            <input
              id="ownerName"
              type="text"
              value={form.ownerName}
              onChange={(e) => updateField('ownerName', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              placeholder="대표자명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 mb-1">
              사업자등록번호
            </label>
            <input
              id="businessNumber"
              type="text"
              value={form.businessNumber}
              onChange={(e) => updateField('businessNumber', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              placeholder="000-00-00000"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              연락처
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              placeholder="010-0000-0000"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '가입 처리 중...' : '회원가입'}
          </button>

          <p className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
