import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const { status } = statusSchema.parse(await request.json())
    const order = await prisma.order.update({ where: { id: params.id }, data: { status } })
    return NextResponse.json({ order })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
