import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSeller } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const seller = await getCurrentSeller()

    if (!seller) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ seller })
  } catch {
    return NextResponse.json(
      { error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const seller = await getCurrentSeller()
  if (!seller) {
    return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 })
  }

  const { storeName, ownerName, businessNumber, phone } = await request.json()

  if (!storeName || !ownerName) {
    return NextResponse.json({ error: '스토어 이름과 대표자명은 필수입니다' }, { status: 400 })
  }

  const updated = await prisma.seller.update({
    where: { id: seller.id },
    data: {
      storeName,
      ownerName,
      businessNumber: businessNumber || null,
      phone: phone || null,
    },
    select: {
      id: true,
      email: true,
      storeName: true,
      ownerName: true,
      businessNumber: true,
      phone: true,
    },
  })

  return NextResponse.json({ seller: updated })
}
