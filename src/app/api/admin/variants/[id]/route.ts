import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  stock: z.number().int().min(0),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const { stock } = schema.parse(await request.json())
    const variant = await prisma.variant.update({
      where: { id: params.id },
      data: { stock },
    })
    return NextResponse.json({ variant })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Stock invalide' }, { status: 400 })
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
