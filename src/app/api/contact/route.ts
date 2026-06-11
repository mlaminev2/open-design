import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(120).trim(),
  email: z.string().email().max(254),
  subject: z.string().max(200).trim().optional(),
  message: z.string().min(1).max(4000).trim(),
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = schema.parse(body)

    const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
    await resend.emails.send({
      from: `Contact Maison Éburne <${process.env.EMAIL_FROM || 'contact@maison-eburne.fr'}>`,
      to: process.env.EMAIL_FROM || 'contact@maison-eburne.fr',
      reply_to: email,
      subject: `Contact : ${escapeHtml(subject || 'Nouveau message')}`,
      html: `
        <p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) a envoyé :</p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;">
          ${escapeHtml(message).replace(/\n/g, '<br>')}
        </blockquote>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
