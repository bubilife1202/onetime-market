import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { detectChannel } from '@/lib/channel'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      roundId,
      buyerName,
      buyerPhone,
      buyerEmail,
      address,
      addressDetail,
      zipCode,
      deliveryMemo,
      items,
    } = body

    if (!roundId || !buyerName || !buyerPhone || !address || !items?.length) {
      return NextResponse.json(
        { error: '필수 정보를 입력해주세요' },
        { status: 400 }
      )
    }

    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: { products: true },
    })

    if (!round) {
      return NextResponse.json(
        { error: '회차를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const now = new Date()
    const isClosed =
      round.status === 'CLOSED' || (round.autoClose && now >= round.endAt)

    if (isClosed) {
      return NextResponse.json(
        { error: '마감된 마켓입니다. 주문이 불가합니다.' },
        { status: 400 }
      )
    }

    const ch = request.nextUrl.searchParams.get('ch')
    const referer = request.headers.get('referer')
    const channel = detectChannel(referer, ch)

    const policySnapshot = JSON.stringify({
      refundPolicy: round.refundPolicy,
      refundPolicyText: round.refundPolicyText,
      capturedAt: new Date().toISOString(),
    })

    let totalAmount = 0
    const orderItems: {
      productId: string
      productName: string
      option: string | null
      quantity: number
      unitPrice: number
      totalPrice: number
    }[] = []

    for (const item of items) {
      const product = round.products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `상품을 찾을 수 없습니다: ${item.productId}` },
          { status: 400 }
        )
      }
      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal
      orderItems.push({
        productId: product.id,
        productName: product.name,
        option: item.option || null,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      })
    }

    const shippingFee = totalAmount >= 50000 ? 0 : 3000

    const order = await prisma.order.create({
      data: {
        roundId,
        orderNumber: generateOrderNumber(),
        status: 'PAID',
        channel,
        buyerName,
        buyerPhone,
        buyerEmail: buyerEmail || null,
        address,
        addressDetail: addressDetail || null,
        zipCode: zipCode || null,
        deliveryMemo: deliveryMemo || null,
        totalAmount: totalAmount + shippingFee,
        shippingFee,
        policySnapshot,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: '주문 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
