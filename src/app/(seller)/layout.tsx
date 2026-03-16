import { redirect } from 'next/navigation'
import { getCurrentSeller } from '@/lib/auth'
import SellerLayoutClient from './SellerLayoutClient'

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seller = await getCurrentSeller()
  if (!seller) {
    redirect('/login')
  }

  return (
    <SellerLayoutClient seller={seller}>
      {children}
    </SellerLayoutClient>
  )
}
