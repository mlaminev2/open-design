'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import type { ShippingOption } from '@/types'

interface Fields {
  firstName: string; lastName: string; email: string
  line1: string; line2: string; city: string; postalCode: string
}

const empty: Fields = { firstName: '', lastName: '', email: '', line1: '', city: '', postalCode: '', line2: '' }

interface CouponState {
  code: string
  discountAmount: number
  label: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [fields, setFields] = useState<Fields>({ ...empty, email: user?.email ?? '' })
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shipping, setShipping] = useState<string>('')
  const [errors, setErrors] = useState<Partial<Fields>>({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<CouponState | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    fetch('/api/shipping')
      .then((r) => r.json())
      .then((d) => {
        const opts: ShippingOption[] = d.options ?? []
        setShippingOptions(opts)
        if (opts.length > 0) setShipping(opts[0].id)
      })
  }, [])

  const shippingOption = shippingOptions.find((o) => o.id === shipping)
  const shippingPrice = shippingOption?.price ?? 0
  const subtotalAfterDiscount = totalPrice - (couponApplied?.discountAmount ?? 0)
  const total = Math.max(0, subtotalAfterDiscount) + shippingPrice

  if (items.length === 0) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p className="auth-title">Panier vide</p>
          <p className="auth-subtitle">Ajoutez des articles avant de commander.</p>
          <Link href="/boutique" className="btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>Voir la boutique</Link>
        </div>
      </div>
    )
  }

  const validate = (): boolean => {
    const e: Partial<Fields> = {}
    if (!fields.firstName.trim()) e.firstName = 'Requis'
    if (!fields.lastName.trim()) e.lastName = 'Requis'
    if (!fields.email.trim() || !/\S+@\S+\.\S+/.test(fields.email)) e.email = 'E-mail invalide'
    if (!fields.line1.trim()) e.line1 = 'Requis'
    if (!fields.city.trim()) e.city = 'Requis'
    if (!fields.postalCode.trim()) e.postalCode = 'Requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError('')
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), orderAmount: totalPrice }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        setCouponError(data.error ?? 'Code invalide ou expiré.')
        setCouponApplied(null)
      } else {
        const c = data.coupon
        const label = c.type === 'PERCENT' ? `−${c.value}%` : `−${(data.discountAmount / 100).toFixed(0)} €`
        setCouponApplied({ code: couponCode.trim().toUpperCase(), discountAmount: data.discountAmount, label })
        setCouponError('')
      }
    } finally {
      setCouponLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setGlobalError('')

    try {
      const res = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping, fields, couponCode: couponApplied?.code ?? null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur de paiement')

      if (data.url) {
        clearCart()
        router.push(data.url)
      } else if (data.orderNumber) {
        clearCart()
        router.push(`/checkout/success?order=${data.orderNumber}`)
      }
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const field = (name: keyof Fields, label: string, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>{label}</label>
      <input
        id={name} type={type} className={`form-input${errors[name] ? ' error' : ''}`}
        value={fields[name]} placeholder={placeholder}
        onChange={(e) => setFields((f) => ({ ...f, [name]: e.target.value }))}
        autoComplete={name}
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  )

  return (
    <div className="checkout-page">
      <form onSubmit={handleSubmit} className="checkout-form">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 300, fontStyle: 'italic', marginBottom: '48px' }}>
          Finaliser la commande
        </h1>

        <p className="checkout-section-title">Coordonnées</p>
        <div className="form-row">
          {field('firstName', 'Prénom')}
          {field('lastName', 'Nom')}
        </div>
        {field('email', 'E-mail', 'email', 'vous@example.com')}

        <p className="checkout-section-title" style={{ marginTop: '32px' }}>Adresse de livraison</p>
        {field('line1', 'Adresse', 'text', '12 rue de la Paix')}
        {field('line2', 'Complément (optionnel)')}
        <div className="form-row">
          {field('postalCode', 'Code postal')}
          {field('city', 'Ville')}
        </div>

        <p className="checkout-section-title" style={{ marginTop: '32px' }}>Mode de livraison</p>
        <div className="shipping-options" role="group" aria-labelledby="shipping-label">
          {shippingOptions.map((opt) => (
            <label key={opt.id} className={`shipping-option${shipping === opt.id ? ' selected' : ''}`}>
              <input
                type="radio" name="shipping" value={opt.id}
                checked={shipping === opt.id}
                onChange={() => setShipping(opt.id)}
              />
              <div className="shipping-option-info">
                <p className="shipping-option-label">{opt.name}</p>
                <p className="shipping-option-delay">{opt.delay}</p>
              </div>
              <span className="shipping-option-price">
                {opt.price === 0 ? 'Offert' : `${(opt.price / 100).toFixed(0)} €`}
              </span>
            </label>
          ))}
        </div>

        <p className="checkout-section-title" style={{ marginTop: '32px' }}>Code promo</p>
        <div className="coupon-input-row">
          <input
            className="form-input coupon-input"
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); if (couponApplied) setCouponApplied(null) }}
            placeholder="VOTRECODE"
            disabled={!!couponApplied}
          />
          {couponApplied ? (
            <button type="button" className="btn-sm" onClick={() => { setCouponApplied(null); setCouponCode('') }}>Retirer</button>
          ) : (
            <button type="button" className="btn-secondary" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
              {couponLoading ? '…' : 'Appliquer'}
            </button>
          )}
        </div>
        {couponError && <p className="coupon-error">{couponError}</p>}
        {couponApplied && (
          <p className="coupon-success">Code <strong>{couponApplied.code}</strong> appliqué — {couponApplied.label}</p>
        )}

        {globalError && (
          <p style={{ color: 'var(--accent)', fontSize: '12px', marginBottom: '16px', marginTop: '16px' }}>{globalError}</p>
        )}

        <button type="submit" className="checkout-pay-btn" disabled={loading || !shippingOption} style={{ marginTop: '32px' }}>
          {loading ? <span className="spinner" /> : `Payer ${(total / 100).toFixed(0)} € →`}
        </button>

        {!user && (
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '16px', textAlign: 'center' }}>
            <Link href="/connexion" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Connexion</Link> pour sauvegarder vos informations
          </p>
        )}
      </form>

      <aside className="checkout-summary" aria-label="Récapitulatif de commande">
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, marginBottom: '32px', letterSpacing: '0.01em' }}>
          Récapitulatif
        </p>

        <ul style={{ listStyle: 'none', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item) => (
            <li key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400 }}>{item.productName}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                  Taille {item.size} · ×{item.quantity}
                </p>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 300, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {((item.price * item.quantity) / 100).toFixed(0)} €
              </span>
            </li>
          ))}
        </ul>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)' }}>
            <span>Sous-total</span><span>{(totalPrice / 100).toFixed(0)} €</span>
          </div>
          {couponApplied && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'oklch(55% 0.18 145)' }}>
              <span>Code {couponApplied.code}</span><span>−{(couponApplied.discountAmount / 100).toFixed(0)} €</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)' }}>
            <span>Livraison</span>
            <span>{shippingPrice === 0 ? 'Offert' : `${(shippingPrice / 100).toFixed(0)} €`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400 }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 300 }}>{(total / 100).toFixed(0)} €</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
