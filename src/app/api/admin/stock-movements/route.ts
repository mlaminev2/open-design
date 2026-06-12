import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    if (!productId) return NextResponse.json({ error: 'productId requis' }, { status: 400 })

    const variants = await prisma.variant.findMany({ where: { productId }, select: { id: true } })
    const variantIds = variants.map((v) => v.id)

    const movements = await prisma.stockMovement.findMany({
      where: { variantId: { in: variantIds } },
      include: { variant: { select: { size: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ movements })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
