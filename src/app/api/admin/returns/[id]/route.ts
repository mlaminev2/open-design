import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'EXCHANGED']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const { status, adminNote } = await request.json()
    if (status && !VALID_STATUSES.includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })

    const ret = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: status ?? undefined,
        adminNote: adminNote !== undefined ? adminNote : undefined,
      },
    })
    return NextResponse.json({ return: ret })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
