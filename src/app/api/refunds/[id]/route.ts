import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeller } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { id } = await params
  const { action, reason } = await request.json()

  const order = await prisma.order.findFirst({
    where: {
      id,
      round: { sellerId: seller.id },
      status: { in: ['CANCEL_REQUESTED', 'REFUND_REQUESTED'] },
    },
  })

  if (!order) {
    return NextResponse.json({ error: '처리할 수 있는 요청을 찾을 수 없습니다' }, { status: 404 })
  }

  if (action === 'approve') {
    const newStatus = order.status === 'CANCEL_REQUESTED' ? 'CANCELLED' : 'REFUNDED'
    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
    })
    return NextResponse.json(updated)
  }

  if (action === 'reject') {
    // Revert to previous status
    const revertStatus = order.trackingNumber ? 'SHIPPED' : 'PAID'
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: revertStatus,
        cancelReason: reason ? `[거절] ${reason}` : order.cancelReason,
        refundReason: reason ? `[거절] ${reason}` : order.refundReason,
      },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: '올바른 action을 입력해주세요 (approve/reject)' }, { status: 400 })
}
