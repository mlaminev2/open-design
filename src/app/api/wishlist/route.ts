import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireAuth()
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.sub },
      include: {
        product: {
          include: { variants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const { productId } = await request.json()
    if (!productId) return NextResponse.json({ error: 'productId manquant' }, { status: 400 })

    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: session.sub, productId } },
      update: {},
      create: { userId: session.sub, productId },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
