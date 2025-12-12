import React from 'react'
import { useCart } from '../contexts/CartContext'
import { money } from '../utils/money'
export default function OrderSuccessModal({ open, onClose, details }) {
  const { total } = useCart()
  if (!open) return null
  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <button className="close" onClick={onClose}>&times;</button>
        <h3>¡Tu comida está casi lista!</h3>
        <p>Tu pedido se está preparando. Total: ${money(details?.total || total)}</p>
        <div style={{display:'flex',gap:8,marginTop:12}}>
          <a className="cart-btn" href={`https://wa.me/573227671829?text=${encodeURIComponent('Quiero confirmar pago. Pedido total: ' + (details?.total || total))}`} target="_blank" rel="noreferrer">Confirmar pago (WhatsApp)</a>
          <button className="cart-btn" onClick={onClose}>Regresar</button>
        </div>
      </div>
    </div>
  )
}