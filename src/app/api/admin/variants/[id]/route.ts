import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  stock: z.number().int().min(0),
  note: z.string().max(200).optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const { stock, note } = schema.parse(await request.json())

    const existing = await prisma.variant.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Variante introuvable' }, { status: 404 })

    const diff = stock - existing.stock
    const movementType = diff >= 0 ? 'RESTOCK' : 'ADJUSTMENT'

    const variant = await prisma.$transaction(async (tx) => {
      const updated = await tx.variant.update({
        where: { id },
        data: { stock },
      })
      if (diff !== 0) {
        await tx.stockMovement.create({
          data: {
            variantId: id,
            type: movementType,
            quantity: diff,
            note: note ?? `Mise à jour manuelle (admin)`,
          },
        })
      }
      return updated
    })

    return NextResponse.json({ variant })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Stock invalide' }, { status: 400 })
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
