'use client'

import Sidebar from '@/components/seller/Sidebar'

interface SellerLayoutClientProps {
  seller: {
    storeName: string
    ownerName: string
    email: string
  }
  children: React.ReactNode
}

export default function SellerLayoutClient({ seller, children }: SellerLayoutClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar seller={seller} />
      <main className="ml-60 p-8">
        {children}
      </main>
    </div>
  )
}
