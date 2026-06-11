import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const products = await prisma.product.findMany({
      where: { isActive: true, ...(category ? { category } : {}) },
      include: { variants: { orderBy: { size: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ products })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
