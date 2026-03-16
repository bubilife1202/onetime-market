import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeller } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { orderIds, carrier, trackingNumbers } = await request.json()

  if (!orderIds?.length || !carrier) {
    return NextResponse.json({ error: '주문ID와 택배사를 입력해주세요' }, { status: 400 })
  }

  // Verify all orders belong to this seller
  const orders = await prisma.order.findMany({
    where: {
      id: { in: orderIds },
      round: { sellerId: seller.id },
    },
  })

  if (orders.length !== orderIds.length) {
    return NextResponse.json({ error: '일부 주문을 찾을 수 없습니다' }, { status: 404 })
  }

  const updates = await Promise.all(
    orderIds.map((orderId: string, index: number) =>
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'SHIPPED',
          trackingCarrier: carrier,
          trackingNumber: trackingNumbers?.[index] || null,
        },
      })
    )
  )

  return NextResponse.json({ updated: updates.length })
}
