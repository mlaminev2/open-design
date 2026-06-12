import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ coupons })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { code, type, value, minOrderAmount, maxUses, expiresAt } = await request.json()
    if (!code || !value) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        type: type === 'FIXED' ? 'FIXED' : 'PERCENT',
        value: parseInt(value),
        minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })
    return NextResponse.json({ coupon }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2002') return NextResponse.json({ error: 'Ce code existe déjà.' }, { status: 409 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
