import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_HOMEPAGE } from '@/lib/homepageSettings'
import type { HomepageSettings } from '@/lib/homepageSettings'

export async function GET() {
  try {
    const record = await prisma.siteSettings.findUnique({ where: { key: 'homepage' } })
    const settings: HomepageSettings = record
      ? (record.value as unknown as HomepageSettings)
      : DEFAULT_HOMEPAGE
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ settings: DEFAULT_HOMEPAGE })
  }
}
