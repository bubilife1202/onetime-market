import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 기존 데이터 삭제
  await prisma.notification.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.round.deleteMany()
  await prisma.seller.deleteMany()

  // 판매자 생성
  const seller = await prisma.seller.create({
    data: {
      email: 'demo@market.kr',
      password: await bcrypt.hash('demo1234', 10),
      storeName: '꽃보다농장',
      ownerName: '김형조',
      businessNumber: '123-45-67890',
      phone: '010-1234-5678',
    },
  })

  // 제3회 판매회차 (라이브 중)
  const round3 = await prisma.round.create({
    data: {
      sellerId: seller.id,
      name: '봄맞이 라이브 특가',
      roundNumber: 3,
      status: 'LIVE',
      linkCode: 'spring-live-3',
      startAt: new Date(),
      endAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      isLive: true,
      refundPolicy: '7DAY',
      refundPolicyText: '수령 후 7일 이내 환불 가능. 단, 신선식품 특성상 단순 변심 반품은 불가하며, 상품 하자 시 사진 증빙과 함께 요청해주세요.',
    },
  })

  // 제3회 상품
  const products3 = await Promise.all([
    prisma.product.create({
      data: {
        roundId: round3.id,
        name: '제주 한라봉 5kg',
        price: 32000,
        originalPrice: 45000,
        description: '서귀포 직송 한라봉. 당도 보장.',
        options: JSON.stringify([
          { name: '5kg (약 15~18과)', stock: 50 },
          { name: '10kg (약 30~36과)', stock: 30 },
        ]),
        stock: 80,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        roundId: round3.id,
        name: '제주 천혜향 3kg',
        price: 28000,
        originalPrice: 38000,
        description: '향이 천 가지! 제주 천혜향.',
        options: JSON.stringify([
          { name: '3kg (약 12~15과)', stock: 60 },
          { name: '5kg (약 20~25과)', stock: 40 },
        ]),
        stock: 100,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        roundId: round3.id,
        name: '한라봉 + 천혜향 세트',
        price: 55000,
        originalPrice: 83000,
        description: '한라봉 3kg + 천혜향 2kg 알뜰 세트.',
        options: JSON.stringify([{ name: '기본 세트', stock: 30 }]),
        stock: 30,
        sortOrder: 3,
      },
    }),
  ])

  // 제3회에 데모 주문 몇 개
  const channels3 = ['KAKAO', 'INSTAGRAM', 'DIRECT', 'KAKAO', 'INSTAGRAM']
  const names3 = ['김민수', '이지은', '박서준', '최유리', '정다은']
  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        roundId: round3.id,
        orderNumber: `HJ-20260316-${String(i + 1).padStart(4, '0')}`,
        status: 'PAID',
        channel: channels3[i],
        buyerName: names3[i],
        buyerPhone: `010-${String(2000 + i).slice(1)}-${String(7000 + i).slice(1)}`,
        address: `서울시 강남구 테헤란로 ${100 + i * 10}`,
        totalAmount: products3[i % 3].price + 3000,
        shippingFee: 3000,
        policySnapshot: JSON.stringify({ policy: '7DAY', text: round3.refundPolicyText }),
        items: {
          create: {
            productId: products3[i % 3].id,
            productName: products3[i % 3].name,
            quantity: 1,
            unitPrice: products3[i % 3].price,
            totalPrice: products3[i % 3].price,
          },
        },
      },
    })
  }

  // 제2회 (마감됨)
  const round2 = await prisma.round.create({
    data: {
      sellerId: seller.id,
      name: '감귤 공동구매',
      roundNumber: 2,
      status: 'SETTLED',
      linkCode: 'tangerine-group-2',
      startAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isLive: false,
      refundPolicy: 'CONDITIONAL',
      refundPolicyText: '상품 하자 시에만 교환/환불 가능',
    },
  })

  const product2 = await prisma.product.create({
    data: {
      roundId: round2.id,
      name: '노지감귤 10kg',
      price: 25000,
      originalPrice: 35000,
      stock: 0,
      sortOrder: 1,
    },
  })

  // 제2회 주문 (다양한 상태)
  const channels2 = ['KAKAO', 'KAKAO', 'INSTAGRAM', 'DIRECT', 'KAKAO', 'INSTAGRAM']
  const statuses2 = ['DELIVERED', 'DELIVERED', 'SHIPPED', 'DELIVERED', 'REFUNDED', 'DELIVERED']
  const names2 = ['한소희', '송강', '전지현', '공유', '이도현', '김태리']
  for (let i = 0; i < 6; i++) {
    await prisma.order.create({
      data: {
        roundId: round2.id,
        orderNumber: `HJ-20260309-${String(i + 1).padStart(4, '0')}`,
        status: statuses2[i],
        channel: channels2[i],
        buyerName: names2[i],
        buyerPhone: `010-${String(3000 + i).slice(1)}-${String(8000 + i).slice(1)}`,
        address: `서울시 서초구 반포대로 ${200 + i * 10}`,
        totalAmount: 28000,
        shippingFee: 3000,
        trackingNumber: statuses2[i] !== 'REFUNDED' ? `CJ${String(1234567890 + i)}` : null,
        trackingCarrier: statuses2[i] !== 'REFUNDED' ? 'CJ대한통운' : null,
        refundReason: statuses2[i] === 'REFUNDED' ? '상품 상태 불량' : null,
        policySnapshot: JSON.stringify({ policy: 'CONDITIONAL', text: '상품 하자 시에만 교환/환불 가능' }),
        items: {
          create: {
            productId: product2.id,
            productName: '노지감귤 10kg',
            quantity: 1,
            unitPrice: 25000,
            totalPrice: 25000,
          },
        },
      },
    })
  }

  // 제1회 (정산 완료)
  await prisma.round.create({
    data: {
      sellerId: seller.id,
      name: '겨울 만감류 특가',
      roundNumber: 1,
      status: 'SETTLED',
      linkCode: 'winter-citrus-1',
      startAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      isLive: false,
      refundPolicy: '7DAY',
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log(`  - Seller: ${seller.email} / demo1234`)
  console.log(`  - Round 3 (LIVE): /m/spring-live-3`)
  console.log(`  - Round 2 (SETTLED): /m/tangerine-group-2`)
  console.log(`  - Round 1 (SETTLED): /m/winter-citrus-1`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
