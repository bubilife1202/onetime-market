import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeller } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { orderId, type, recipient, message } = await request.json()

  if (!type || !recipient || !message) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
  }

  // Verify order belongs to seller if orderId provided
  if (orderId) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        round: { sellerId: seller.id },
      },
    })
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }
  }

  // DB 저장만 (시뮬레이션 - 실제 알림톡 발송 없음)
  const notification = await prisma.notification.create({
    data: {
      orderId: orderId || null,
      type,
      recipient,
      message,
      status: 'SIMULATED',
    },
  })

  return NextResponse.json({
    ...notification,
    _notice: '시뮬레이션 모드: 실제 알림톡은 발송되지 않았습니다',
  })
}
