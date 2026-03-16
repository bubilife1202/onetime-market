import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeller } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { orderId } = await params
  const { carrier, trackingNumber, status } = await request.json()

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      round: { sellerId: seller.id },
    },
  })

  if (!order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  if (carrier !== undefined) updateData.trackingCarrier = carrier
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
  if (status) updateData.status = status
  else if (carrier || trackingNumber) updateData.status = 'SHIPPED'

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  })

  return NextResponse.json(updated)
}
