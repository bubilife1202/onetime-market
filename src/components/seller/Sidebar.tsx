'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SellerInfo {
  storeName: string
  ownerName: string
  email: string
}

interface SidebarProps {
  seller: SellerInfo
}

const navItems = [
  { href: '/dashboard', icon: '📊', label: '대시보드' },
  { href: '/rounds', icon: '🔄', label: '회차 관리' },
  { href: '/orders', icon: '📦', label: '주문 관리' },
  { href: '/products', icon: '🏷️', label: '상품 관리' },
  { href: '/shipping', icon: '🚚', label: '배송 관리' },
  { href: '/customers', icon: '👥', label: '고객 관리' },
  { href: '/analytics', icon: '📈', label: '매출 분석' },
  { href: '/settings', icon: '⚙️', label: '설정' },
]

export default function Sidebar({ seller }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0F172A] text-white flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🛒</span>
          <span className="text-lg font-bold">일회용마켓</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Seller Profile */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {seller.storeName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{seller.storeName}</p>
            <p className="text-xs text-gray-400 truncate">{seller.ownerName}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
