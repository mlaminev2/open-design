import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAuth, formatUser, signToken, setAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { firstName, lastName, email, currentPassword, newPassword } = body

    const user = await prisma.user.findUnique({ where: { id: session.sub } })
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Mot de passe actuel requis.' }, { status: 400 })
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
      if (newPassword.length < 6) return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères.' }, { status: 400 })
    }

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (firstName !== undefined) updateData.firstName = firstName || null
    if (lastName !== undefined) updateData.lastName = lastName || null
    if (email) updateData.email = email
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 12)

    const updated = await prisma.user.update({
      where: { id: session.sub },
      data: updateData,
    })

    // Reissue token if email changed
    if (email && email !== user.email) {
      const token = await signToken({ sub: updated.id, role: updated.role })
      await setAuthCookie(token)
    }

    return NextResponse.json({ user: formatUser(updated) })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
