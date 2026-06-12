import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const session = await requireAuth()
    const { productId } = await params
    await prisma.wishlistItem.deleteMany({
      where: { userId: session.sub, productId },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
