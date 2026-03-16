import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeller } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const roundId = searchParams.get('roundId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {
    round: { sellerId: seller.id },
  }

  if (roundId) {
    where.roundId = roundId
  }

  if (status) {
    where.status = status
  } else {
    where.status = {
      in: ['CANCEL_REQUESTED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUNDED'],
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      round: { select: { id: true, name: true, roundNumber: true, status: true, refundPolicy: true, refundPolicyText: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const rounds = await prisma.round.findMany({
    where: { sellerId: seller.id },
    select: { id: true, name: true, roundNumber: true, status: true },
    orderBy: { roundNumber: 'desc' },
  })

  const stats = {
    total: orders.length,
    cancelRequested: orders.filter(o => o.status === 'CANCEL_REQUESTED').length,
    refundRequested: orders.filter(o => o.status === 'REFUND_REQUESTED').length,
    processed: orders.filter(o => o.status === 'CANCELLED' || o.status === 'REFUNDED').length,
  }

  return NextResponse.json({ orders, rounds, stats })
}
