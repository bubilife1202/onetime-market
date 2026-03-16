export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateOrderNumber(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `HJ-${dateStr}-${rand}`
}

export function generateLinkCode(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 20)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${slug}-${rand}`
}

export function getDiscountPercent(original: number, price: number): number {
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 100)
}

export function getRemainingTime(endAt: Date | string): {
  hours: number
  minutes: number
  seconds: number
  expired: boolean
} {
  const diff = new Date(endAt).getTime() - Date.now()
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  }
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: '예정',
    LIVE: '라이브 중',
    CLOSED: '마감',
    SETTLED: '정산완료',
    PAID: '결제완료',
    SHIPPING_READY: '배송준비중',
    SHIPPED: '발송완료',
    DELIVERED: '배송완료',
    CANCEL_REQUESTED: '취소요청',
    CANCELLED: '취소완료',
    REFUND_REQUESTED: '환불요청',
    REFUNDED: '환불완료',
  }
  return map[status] || status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-slate-100 text-slate-700',
    LIVE: 'bg-red-100 text-red-700',
    CLOSED: 'bg-gray-100 text-gray-700',
    SETTLED: 'bg-green-100 text-green-700',
    PAID: 'bg-blue-100 text-blue-700',
    SHIPPING_READY: 'bg-yellow-100 text-yellow-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCEL_REQUESTED: 'bg-orange-100 text-orange-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
    REFUND_REQUESTED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-gray-100 text-gray-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}
