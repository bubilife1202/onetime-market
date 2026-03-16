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
      orders: {
        select: {
          id: true,
          totalAmount: true,
          shippingFee: true,
          channel: true,
          status: true,
        },
      },
    },
  })

  if (!round) {
    return NextResponse.json({ error: '회차를 찾을 수 없습니다' }, { status: 404 })
  }

  const orders = round.orders
  const totalOrders = orders.length
  const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingShipment = orders.filter(
    (o) => o.status === 'PAID' || o.status === 'SHIPPING_READY'
  ).length

  // Channel breakdown
  const channelMap: Record<string, number> = {}
  for (const order of orders) {
    channelMap[order.channel] = (channelMap[order.channel] || 0) + 1
  }
  const channels = Object.entries(channelMap).map(([channel, count]) => ({
    channel,
    count,
    percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
  }))
  channels.sort((a, b) => b.count - a.count)

  // Conversion rate (simplified: orders / 100 assumed visitors per round as placeholder)
  const conversionRate = totalOrders > 0 ? Math.min(totalOrders * 2, 100) : 0

  return NextResponse.json({
    totalOrders,
    revenue,
    pendingShipment,
    conversionRate,
    channels,
  })
}
