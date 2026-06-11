import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  category: z.string().optional(),
  isLimited: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string()).optional(),
})

const putSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
  price: z.number().int().positive(),
  category: z.string().min(1).max(100),
  isLimited: z.boolean(),
  isActive: z.boolean(),
  images: z.array(z.string()).default([]),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().min(1).max(10),
    stock: z.number().int().min(0),
  })).min(1),
})

/** PATCH — modification partielle (ex: toggle isActive) */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const data = patchSchema.parse(await request.json())
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

/** PUT — mise à jour complète avec recréation des variantes */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const { variants, ...data } = putSchema.parse(await request.json())

    const product = await prisma.$transaction(async (tx) => {
      // Récupérer les variantes existantes
      const existing = await tx.variant.findMany({ where: { productId: params.id } })
      const existingIds = existing.map((v) => v.id)

      const variantsWithId = variants.filter((v) => v.id)
      const variantsNew = variants.filter((v) => !v.id)
      const incomingIds = variantsWithId.map((v) => v.id as string)

      // Supprimer les variantes retirées
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id))
      if (toDelete.length) await tx.variant.deleteMany({ where: { id: { in: toDelete } } })

      // Mettre à jour les variantes existantes
      for (const v of variantsWithId) {
        await tx.variant.update({ where: { id: v.id }, data: { size: v.size, stock: v.stock } })
      }

      // Créer les nouvelles variantes
      if (variantsNew.length) {
        await tx.variant.createMany({
          data: variantsNew.map((v) => ({ productId: params.id, size: v.size, stock: v.stock })),
        })
      }

      return tx.product.update({
        where: { id: params.id },
        data,
        include: { variants: { orderBy: { size: 'asc' } } },
      })
    })

    return NextResponse.json({ product })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides', details: err.errors }, { status: 400 })
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** DELETE — désactivation douce */
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
