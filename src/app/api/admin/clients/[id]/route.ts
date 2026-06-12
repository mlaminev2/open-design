import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: true,
        addresses: {
          select: {
            id: true,
            isDefault: true,
            firstName: true,
            lastName: true,
            line1: true,
            line2: true,
            city: true,
            postalCode: true,
            country: true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            shippingMethod: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                unitPrice: true,
                size: true,
                product: { select: { name: true, slug: true } },
              },
            },
          },
        },
        _count: { select: { orders: true } },
      },
    })
    if (!user) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const PAID_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    const totalSpent = user.orders
      .filter((o) => PAID_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + o.total, 0)

    return NextResponse.json({ user, totalSpent })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
