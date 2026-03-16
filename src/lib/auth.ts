import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'disposable-market-demo-secret-2026'

export function signToken(sellerId: string): string {
  return jwt.sign({ sellerId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { sellerId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sellerId: string }
  } catch {
    return null
  }
}

export async function getCurrentSeller() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return prisma.seller.findUnique({
    where: { id: payload.sellerId },
    select: {
      id: true,
      email: true,
      storeName: true,
      ownerName: true,
      businessNumber: true,
      phone: true,
    },
  })
}
