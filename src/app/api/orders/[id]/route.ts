import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { imageUrl: true },
          },
        },
      },
      round: {
        select: {
          name: true,
          roundNumber: true,
          linkCode: true,
          seller: {
            select: { storeName: true, phone: true },
          },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json(
      { error: '주문을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  return NextResponse.json(order)
}
