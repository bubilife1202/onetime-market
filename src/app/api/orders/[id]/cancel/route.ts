import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const order = await prisma.order.findUnique({ where: { id } })

  if (!order) {
    return NextResponse.json(
      { error: '주문을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  if (!['PAID', 'SHIPPING_READY'].includes(order.status)) {
    return NextResponse.json(
      { error: '취소가 불가능한 상태입니다' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { cancelReason } = body

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: 'CANCEL_REQUESTED',
      cancelReason: cancelReason || '구매자 취소 요청',
    },
  })

  return NextResponse.json(updated)
}
