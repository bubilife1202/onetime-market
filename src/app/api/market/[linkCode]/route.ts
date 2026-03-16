import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ linkCode: string }> }
) {
  const { linkCode } = await params

  const round = await prisma.round.findUnique({
    where: { linkCode },
    include: {
      seller: {
        select: {
          id: true,
          storeName: true,
          ownerName: true,
          businessNumber: true,
        },
      },
      products: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!round) {
    return NextResponse.json({ error: '마켓을 찾을 수 없습니다' }, { status: 404 })
  }

  const now = new Date()
  let computedStatus = round.status
  if (round.status === 'SCHEDULED' && now >= round.startAt) {
    computedStatus = 'LIVE'
  }
  if (round.autoClose && now >= round.endAt) {
    computedStatus = 'CLOSED'
  }

  return NextResponse.json({
    id: round.id,
    name: round.name,
    roundNumber: round.roundNumber,
    status: computedStatus,
    isLive: round.isLive || computedStatus === 'LIVE',
    linkCode: round.linkCode,
    startAt: round.startAt,
    endAt: round.endAt,
    refundPolicy: round.refundPolicy,
    refundPolicyText: round.refundPolicyText,
    seller: round.seller,
    products: round.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      description: p.description,
      options: p.options ? JSON.parse(p.options) : null,
      stock: p.stock,
      imageUrl: p.imageUrl,
      sortOrder: p.sortOrder,
    })),
  })
}
