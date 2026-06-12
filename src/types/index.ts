export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  isLimited: boolean
  isActive: boolean
  images: string[]
  variants: Variant[]
  createdAt: string
}

export interface Variant {
  id: string
  productId: string
  size: string
  stock: number
}

export interface CartItem {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  size: string
  price: number
  quantity: number
}

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'CUSTOMER' | 'ADMIN'
}

export interface Address {
  id: string
  firstName: string
  lastName: string
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  shippingCost: number
  total: number
  shippingMethod: string
  createdAt: string
  items: OrderItem[]
  address?: Address
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  size: string
  quantity: number
  unitPrice: number
}

export const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Livraison Standard', delay: '5–7 jours ouvrés', price: 800 },
  { id: 'express', label: 'Livraison Express', delay: '2–3 jours ouvrés', price: 1500 },
  { id: 'overnight', label: 'Livraison le lendemain', delay: 'Lendemain avant 13h', price: 2500 },
] as const

export interface ShippingOption {
  id: string
  name: string
  delay: string
  price: number
  isActive: boolean
  sortOrder: number
}

export interface Coupon {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED'
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
}

export interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: { firstName: string | null; lastName: string | null }
}

export interface ReturnRequest {
  id: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'EXCHANGED'
  adminNote: string | null
  createdAt: string
  order: { orderNumber: string; total: number; createdAt: string }
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payée',
  PROCESSING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
}
