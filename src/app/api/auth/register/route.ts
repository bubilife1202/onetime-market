import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, storeName, ownerName, businessNumber, phone } =
      await request.json()

    if (!email || !password || !storeName || !ownerName) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    const existing = await prisma.seller.findUnique({ where: { email } })

    if (existing) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const seller = await prisma.seller.create({
      data: {
        email,
        password: hashedPassword,
        storeName,
        ownerName,
        businessNumber: businessNumber || null,
        phone: phone || null,
      },
    })

    const token = signToken(seller.id)

    const response = NextResponse.json(
      {
        seller: {
          id: seller.id,
          email: seller.email,
          storeName: seller.storeName,
          ownerName: seller.ownerName,
        },
      },
      { status: 201 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
