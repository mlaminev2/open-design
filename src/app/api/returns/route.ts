import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireAuth()
    const returns = await prisma.returnRequest.findMany({
      where: { userId: session.sub },
      include: { order: { select: { orderNumber: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ returns })
  } catch {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const { orderId, reason, items } = await request.json()

    if (!orderId || !reason?.trim() || !items?.length) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.sub, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
    })
    if (!order) return NextResponse.json({ error: 'Commande introuvable ou non éligible au retour.' }, { status: 404 })

    const existing = await prisma.returnRequest.findFirst({ where: { orderId, userId: session.sub } })
    if (existing) return NextResponse.json({ error: 'Une demande de retour existe déjà pour cette commande.' }, { status: 409 })

    const ret = await prisma.returnRequest.create({
      data: { orderId, userId: session.sub, reason: reason.trim(), items },
    })
    return NextResponse.json({ return: ret })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
