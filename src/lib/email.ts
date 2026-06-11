import { Resend } from 'resend'
import type { Order } from '@/types'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}
const FROM = process.env.EMAIL_FROM || 'commandes@maison-eburne.fr'

export async function sendOrderConfirmation(
  to: string,
  order: Order & { firstName: string }
): Promise<void> {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;font-family:'DM Sans',sans-serif;font-size:14px;color:#2e2418;">${item.productName} — ${item.size}</td>
          <td style="padding:8px 0;text-align:right;font-family:'DM Sans',sans-serif;font-size:14px;color:#2e2418;">×${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;font-family:'DM Sans',sans-serif;font-size:14px;color:#2e2418;">${(item.unitPrice * item.quantity / 100).toFixed(2)} €</td>
        </tr>`
    )
    .join('')

  await getResend().emails.send({
    from: `Maison Éburne <${FROM}>`,
    to,
    subject: `Commande confirmée — ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#f7f3ed;margin:0;padding:40px 20px;font-family:'DM Sans',Helvetica,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#fefcf9;padding:48px;">
          <p style="font-family:Georgia,serif;font-size:22px;color:#2e2418;margin:0 0 32px;letter-spacing:0.12em;text-transform:uppercase;">Maison Éburne</p>
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:300;font-style:italic;color:#2e2418;margin:0 0 8px;">Commande confirmée.</h1>
          <p style="font-size:13px;color:#7a6b5a;margin:0 0 32px;">N° ${order.orderNumber}</p>
          <p style="font-size:14px;color:#2e2418;margin:0 0 24px;">Merci ${order.firstName}, votre commande a bien été reçue.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e0d4;margin-bottom:16px;">
            ${itemsHtml}
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e0d4;padding-top:16px;">
            <tr>
              <td style="font-size:13px;color:#7a6b5a;">Livraison</td>
              <td style="text-align:right;font-size:13px;color:#7a6b5a;">${(order.shippingCost / 100).toFixed(2)} €</td>
            </tr>
            <tr>
              <td style="font-size:15px;font-weight:500;color:#2e2418;padding-top:8px;">Total</td>
              <td style="text-align:right;font-size:15px;font-weight:500;color:#2e2418;padding-top:8px;">${(order.total / 100).toFixed(2)} €</td>
            </tr>
          </table>
          <p style="font-size:12px;color:#7a6b5a;margin-top:40px;border-top:1px solid #e8e0d4;padding-top:24px;">Maison Éburne · Paris, SS25 · L'Élégance Redéfinie</p>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendPasswordReset(to: string, resetUrl: string): Promise<void> {
  await getResend().emails.send({
    from: `Maison Éburne <${FROM}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px;">
        <p style="font-size:22px;letter-spacing:0.12em;text-transform:uppercase;">Maison Éburne</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans 1 heure.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#5c2d1a;color:#f7f3ed;text-decoration:none;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;">Réinitialiser le mot de passe</a>
        <p style="font-size:12px;color:#999;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      </div>
    `,
  })
}
