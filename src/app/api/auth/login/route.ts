import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { rateLimit, getClientKey } from '@/lib/rateLimit'

export async function POST(request: Request) {
  // 10 attempts per 15 min per IP
  const rl = rateLimit(getClientKey(request, 'login'), { limit: 10, windowSec: 900 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } })

    // Always run bcrypt.compare even if user not found (timing attack mitigation)
    const fakeHash = '$2a$12$fakehashtopreventtimingattacksXXXXXXXXXXXXXXXXXXXXXXXX'
    const valid = user ? await bcrypt.compare(String(password), user.password) : await bcrypt.compare(String(password), fakeHash)

    if (!user || !valid) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const token = await signToken({ sub: user.id, role: user.role })
    await setAuthCookie(token)

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
