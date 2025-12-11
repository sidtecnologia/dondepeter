import React from 'react'
import { money } from '../utils/money.js'

export default function OrderSuccessModal({ open, onClose, orderDetails, onConfirm }) {
  if (!open) return null
  return (
    <div id="orderSuccessModal" className="modal" style={{ display: 'flex' }} aria-hidden="false">
      <div className="modal-content-wrapper">
        <div className="success-modal-card">
          <button className="modal-close close-success-btn" aria-label="Cerrar" onClick={onClose}>&times;</button>
          <h2>¡Tu comida está casi lista!</h2>
          <p>Tu pedido se está preparando. Solo falta confirmar el pago y saldrá para tu dirección.</p>
          <p><strong>Total:</strong> ${money(orderDetails.total || 0)}</p>
          <p>Gracias por tu compra.</p>
          <button id="whatsapp-btn" className="checkout-btn" onClick={onConfirm}><i className="fab fa-whatsapp"></i> Confirmar pago</button>
          <button id="close-success-btn" className="add-to-cart-btn" style={{ background: '#666' }} onClick={onClose}>Regresar</button>
        </div>
      </div>
    </div>
  )
}