import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  category: z.string().optional(),
  isLimited: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string()).optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const data = updateSchema.parse(body)

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { variants: true },
    })
    return NextResponse.json({ product })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    await prisma.product.update({ where: { id: params.id }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
