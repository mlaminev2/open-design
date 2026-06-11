import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail.' }, { status: 409 })

    const hashed = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: { email: data.email, password: hashed, firstName: data.firstName, lastName: data.lastName },
    })

    const token = await signToken({ sub: user.id, role: user.role })
    await setAuthCookie(token)

    return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
