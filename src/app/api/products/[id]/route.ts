import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], isActive: true },
      include: { variants: { orderBy: { size: 'asc' } } },
    })
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
