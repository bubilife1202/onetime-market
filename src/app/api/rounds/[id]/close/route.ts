import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeller } from '@/lib/auth'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const existing = await prisma.round.findFirst({
    where: { id, sellerId: seller.id },
  })
  if (!existing) {
    return NextResponse.json({ error: '회차를 찾을 수 없습니다' }, { status: 404 })
  }

  if (existing.status === 'CLOSED') {
    return NextResponse.json({ error: '이미 마감된 회차입니다' }, { status: 400 })
  }

  const round = await prisma.round.update({
    where: { id },
    data: {
      status: 'CLOSED',
      isLive: false,
      endAt: new Date(),
    },
  })

  return NextResponse.json(round)
}
