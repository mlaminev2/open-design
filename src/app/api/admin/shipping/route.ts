import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
    const options = await prisma.shippingOption.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ options })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { name, delay, price, sortOrder } = await request.json()
    if (!name || !delay || price === undefined) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    const option = await prisma.shippingOption.create({
      data: { name, delay, price: parseInt(price), sortOrder: sortOrder ?? 0 },
    })
    return NextResponse.json({ option }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
