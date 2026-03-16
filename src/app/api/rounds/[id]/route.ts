import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeller } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const round = await prisma.round.findFirst({
    where: { id, sellerId: seller.id },
    include: {
      products: { orderBy: { sortOrder: 'asc' } },
      orders: {
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { orders: true, products: true } },
    },
  })

  if (!round) {
    return NextResponse.json({ error: '회차를 찾을 수 없습니다' }, { status: 404 })
  }

  return NextResponse.json(round)
}

export async function PUT(
  request: NextRequest,
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

  const body = await request.json()
  const round = await prisma.round.update({
    where: { id },
    data: {
      name: body.name,
      startAt: body.startAt ? new Date(body.startAt) : undefined,
      endAt: body.endAt ? new Date(body.endAt) : undefined,
      autoClose: body.autoClose,
      refundPolicy: body.refundPolicy,
      refundPolicyText: body.refundPolicyText,
    },
  })

  return NextResponse.json(round)
}

export async function DELETE(
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

  if (existing.status === 'LIVE') {
    return NextResponse.json({ error: '라이브 중인 회차는 삭제할 수 없습니다' }, { status: 400 })
  }

  // Delete related data first
  await prisma.orderItem.deleteMany({
    where: { order: { roundId: id } },
  })
  await prisma.notification.deleteMany({
    where: { order: { roundId: id } },
  })
  await prisma.order.deleteMany({ where: { roundId: id } })
  await prisma.product.deleteMany({ where: { roundId: id } })
  await prisma.round.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
