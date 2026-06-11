import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { userId: session.sub },
      include: {
        items: { include: { product: { select: { name: true } }, variant: { select: { size: true } } } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      subtotal: o.subtotal,
      shippingCost: o.shippingCost,
      total: o.total,
      shippingMethod: o.shippingMethod,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.product.name,
        size: i.size,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    }))

    return NextResponse.json({ orders: formatted })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
