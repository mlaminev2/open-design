import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
  category: z.string().min(1),
  isLimited: z.boolean().default(true),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).default([]),
  variants: z.array(z.object({ size: z.string(), stock: z.number().int().min(0) })),
})

export async function GET() {
  try {
    await requireAdmin()
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ products })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { variants, ...data } = productSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        ...data,
        variants: {
          create: variants.map((v) => ({ size: v.size, stock: v.stock })),
        },
      },
      include: { variants: true },
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides', details: err.errors }, { status: 400 })
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
