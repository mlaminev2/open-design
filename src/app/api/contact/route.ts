import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()
    if (!name || !email || !message) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

    const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
    await resend.emails.send({
      from: `Contact Maison Éburne <${process.env.EMAIL_FROM || 'contact@maison-eburne.fr'}>`,
      to: process.env.EMAIL_FROM || 'contact@maison-eburne.fr',
      reply_to: email,
      subject: `Contact : ${subject || 'Nouveau message'}`,
      html: `<p><strong>${name}</strong> (${email}) a envoyé :</p><blockquote>${message}</blockquote>`,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
