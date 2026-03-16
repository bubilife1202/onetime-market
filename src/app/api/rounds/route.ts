import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSeller } from '@/lib/auth'
import { generateLinkCode } from '@/lib/utils'

export async function GET() {
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const rounds = await prisma.round.findMany({
    where: { sellerId: seller.id },
    include: {
      _count: { select: { orders: true, products: true } },
    },
    orderBy: { roundNumber: 'desc' },
  })

  return NextResponse.json(rounds)
}

export async function POST(request: NextRequest) {
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const body = await request.json()
  const { name, startAt, endAt, autoClose, refundPolicy, refundPolicyText, products } = body

  // Get next round number
  const lastRound = await prisma.round.findFirst({
    where: { sellerId: seller.id },
    orderBy: { roundNumber: 'desc' },
  })
  const roundNumber = (lastRound?.roundNumber || 0) + 1

  const linkCode = generateLinkCode(name)

  const now = new Date()
  const start = new Date(startAt)
  const isLive = start <= now && new Date(endAt) > now

  const round = await prisma.round.create({
    data: {
      sellerId: seller.id,
      name,
      roundNumber,
      linkCode,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      autoClose: autoClose ?? true,
      isLive,
      status: isLive ? 'LIVE' : 'SCHEDULED',
      refundPolicy: refundPolicy || '7DAY',
      refundPolicyText,
      products: products?.length
        ? {
            create: products.map((p: { name: string; price: number; originalPrice?: number; description?: string; options?: string; stock?: number }, i: number) => ({
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice,
              description: p.description,
              options: p.options,
              stock: p.stock ?? 100,
              sortOrder: i,
            })),
          }
        : undefined,
    },
    include: {
      products: true,
      _count: { select: { orders: true } },
    },
  })

  return NextResponse.json(round, { status: 201 })
}
