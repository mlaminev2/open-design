'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { ProductPlaceholder } from '@/components/ProductPlaceholder'

export default function CartDrawer() {
  const { items, isOpen, totalPrice, closeCart, removeItem, updateQty } = useCart()

  return (
    <>
      <div
        className={`cart-overlay${isOpen ? ' open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`cart-drawer${isOpen ? ' open' : ''}`}
        aria-label="Panier"
        aria-modal="true"
        role="dialog"
      >
        <div className="cart-header">
          <h2 className="cart-title">Panier</h2>
          <button onClick={closeCart} className="cart-close" aria-label="Fermer le panier">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-text">Votre panier est vide.</p>
            <button onClick={closeCart} className="btn-secondary" style={{ width: 'auto', padding: '12px 28px' }}>
              <Link href="/boutique" onClick={closeCart}>Découvrir la collection →</Link>
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-items" aria-label="Articles dans le panier">
              {items.map((item) => (
                <li key={item.variantId} className="cart-item">
                  <div className="cart-item-img">
                    <ProductPlaceholder slug={item.productSlug} />
                  </div>
                  <div>
                    <p className="cart-item-name">{item.productName}</p>
                    <p className="cart-item-size">Taille {item.size}</p>
                    <div className="cart-item-qty" role="group" aria-label="Quantité">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.variantId, item.quantity - 1)}
                        aria-label="Diminuer la quantité"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.variantId, item.quantity + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Retirer ${item.productName} du panier`}
                    >
                      Retirer
                    </button>
                  </div>
                  <span className="cart-item-price">
                    {((item.price * item.quantity) / 100).toFixed(0)} €
                  </span>
                </li>
              ))}
            </ul>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">Sous-total</span>
                <span className="cart-total-amount">{(totalPrice / 100).toFixed(0)} €</span>
              </div>
              <Link href="/checkout">
                <button className="cart-checkout-btn" onClick={closeCart}>
                  Finaliser la commande →
                </button>
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
