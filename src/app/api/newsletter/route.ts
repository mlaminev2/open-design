import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'E-mail invalide' }, { status: 400 })
    }
    const session = await getSession()
    await prisma.newsletterSubscription.upsert({
      where: { email },
      update: {},
      create: { email, userId: session?.sub ?? undefined },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
