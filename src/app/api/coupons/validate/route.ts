import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { code, orderAmount } = await request.json()
    if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 })

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })

    if (!coupon || !coupon.isActive) return NextResponse.json({ error: 'Code promo invalide ou inactif.' }, { status: 400 })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return NextResponse.json({ error: 'Ce code promo a expiré.' }, { status: 400 })
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: 'Ce code promo a atteint sa limite d\'utilisation.' }, { status: 400 })
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        error: `Commande minimum de ${(coupon.minOrderAmount / 100).toFixed(0)} € requise pour ce code.`,
      }, { status: 400 })
    }

    const discountAmount = coupon.type === 'PERCENT'
      ? Math.round(orderAmount * coupon.value / 100)
      : Math.min(coupon.value, orderAmount)

    return NextResponse.json({
      valid: true,
      coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value },
      discountAmount,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
