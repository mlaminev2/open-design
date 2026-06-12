import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_HOMEPAGE } from '@/lib/homepageSettings'
import type { HomepageSettings } from '@/lib/homepageSettings'

export async function GET() {
  try {
    await requireAdmin()
    const record = await prisma.siteSettings.findUnique({ where: { key: 'homepage' } })
    const settings: HomepageSettings = record
      ? (record.value as unknown as HomepageSettings)
      : DEFAULT_HOMEPAGE
    return NextResponse.json({ settings })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const settings: HomepageSettings = {
      hero: {
        eyebrow: String(body.hero?.eyebrow ?? DEFAULT_HOMEPAGE.hero.eyebrow),
        titleLine1: String(body.hero?.titleLine1 ?? DEFAULT_HOMEPAGE.hero.titleLine1),
        titleLine2: String(body.hero?.titleLine2 ?? DEFAULT_HOMEPAGE.hero.titleLine2),
        subtitle: String(body.hero?.subtitle ?? DEFAULT_HOMEPAGE.hero.subtitle),
        ctaText: String(body.hero?.ctaText ?? DEFAULT_HOMEPAGE.hero.ctaText),
        ctaLink: String(body.hero?.ctaLink ?? DEFAULT_HOMEPAGE.hero.ctaLink),
      },
      sections: {
        showPhilosophy: Boolean(body.sections?.showPhilosophy ?? true),
        showLookbook: Boolean(body.sections?.showLookbook ?? true),
      },
      collection: {
        mode: body.collection?.mode === 'manual' ? 'manual' : 'auto',
        productIds: Array.isArray(body.collection?.productIds) ? body.collection.productIds : [],
        maxItems: Math.min(12, Math.max(1, parseInt(body.collection?.maxItems) || 4)),
      },
    }
    await prisma.siteSettings.upsert({
      where: { key: 'homepage' },
      update: { value: settings as object },
      create: { key: 'homepage', value: settings as object },
    })
    return NextResponse.json({ settings })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
