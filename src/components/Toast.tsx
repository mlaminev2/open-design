'use client'

import { useCart } from '@/context/CartContext'

export default function Toast() {
  const { toast } = useCart()
  if (!toast) return null
  return (
    <div className="toast entering" role="status" aria-live="polite">
      {toast}
    </div>
  )
}
