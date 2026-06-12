import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULTS = [
  { id: 'standard', name: 'Livraison Standard', delay: '5–7 jours ouvrés', price: 800, isActive: true, sortOrder: 0 },
  { id: 'express', name: 'Livraison Express', delay: '2–3 jours ouvrés', price: 1500, isActive: true, sortOrder: 1 },
  { id: 'overnight', name: 'Livraison le lendemain', delay: 'Lendemain avant 13h', price: 2500, isActive: true, sortOrder: 2 },
]

export async function GET() {
  try {
    let options = await prisma.shippingOption.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (options.length === 0) {
      // Seed defaults on first call
      await prisma.shippingOption.createMany({ data: DEFAULTS })
      options = await prisma.shippingOption.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })
    }
    return NextResponse.json({ options })
  } catch {
    return NextResponse.json({ options: DEFAULTS })
  }
}
