import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: { select: { name: true } } } },
        user: { select: { email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ orders })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
