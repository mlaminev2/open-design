import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: session.sub },
      include: {
        items: { include: { product: { select: { name: true } } } },
        address: true,
      },
    })
    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
