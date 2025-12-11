import React from 'react'
import { money } from '../utils/money.js'

export default function CartModal({ open, onClose, cart, onInc, onDec, total, onCheckout }) {
  if (!open) return null
  function onOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }
  return (
    <div id="cartModal" className="modal" style={{ display: 'flex' }} aria-hidden="false" onClick={onOverlayClick}>
      <div className="modal-content-wrapper">
        <div className="cart-modal-card">
          <button className="modal-close close-cart-btn" aria-label="Cerrar" onClick={onClose}>&times;</button>
          <h3>Tu pedido</h3>
          <div id="cart-items" className="cart-items">
            {cart.length === 0 ? <p className="empty-cart-msg">Tu carrito está vacío.</p> : cart.map((item, idx) => (
              <div className="cart-item" key={item.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: 12 }}>{item.qty} x ${money(item.price)}</div>
                  </div>
                </div>
                <div className="controls">
                  <button className="qty-btn" data-idx={idx} data-op="dec" onClick={() => onDec(idx)}>-</button>
                  <button className="qty-btn" data-idx={idx} data-op="inc" onClick={() => onInc(idx)}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <strong>Total: ${money(total)}</strong>
          </div>
          <button id="checkout-btn" className="checkout-btn" onClick={onCheckout}>Hacer Pedido</button>
        </div>
      </div>
    </div>
  )
}