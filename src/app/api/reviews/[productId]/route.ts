import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const reviews = await prisma.review.findMany({
    where: { productId, status: 'APPROVED' },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ reviews })
}

export async function POST(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  const { productId } = await params
  const { rating, title, comment } = await request.json()

  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Note entre 1 et 5 requise' }, { status: 400 })
  if (!comment || comment.trim().length < 10) return NextResponse.json({ error: 'Commentaire trop court (min 10 caractères)' }, { status: 400 })

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: session.sub, productId } },
  })
  if (existing) return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour ce produit.' }, { status: 409 })

  const review = await prisma.review.create({
    data: { userId: session.sub, productId, rating, title: title?.trim() || null, comment: comment.trim(), status: 'PENDING' },
  })
  return NextResponse.json({ review, message: 'Votre avis est en attente de modération.' })
}
