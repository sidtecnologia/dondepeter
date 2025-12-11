import React, { useState } from 'react'

export default function CheckoutModal({ open, onClose, onFinalize }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState('Efectivo')
  const [accepted, setAccepted] = useState(false)

  if (!open) return null

  function submit() {
    if (!accepted) {
      alert('Debes aceptar los Términos y Condiciones y la Política de Datos para continuar.')
      return
    }
    if (!name || !address) {
      alert('Por favor completa nombre y dirección')
      return
    }
    onFinalize({ name, address, payment })
    setName('')
    setAddress('')
    setPayment('Efectivo')
    setAccepted(false)
  }

  return (
    <div id="checkoutModal" className="modal" style={{ display: 'flex' }} aria-hidden="false">
      <div className="modal-content-wrapper">
        <div className="checkout-modal-card">
          <button className="modal-close close-checkout-btn" aria-label="Cerrar" onClick={onClose}>&times;</button>
          <h2>Datos de entrega</h2>
          <div className="form-group">
            <label>Nombre:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" required />
          </div>
          <div className="form-group">
            <label>Dirección:</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Tu dirección de entrega" required />
          </div>
          <label>Método de pago:</label>
          <div>
            <label><input type="radio" name="payment" value="Efectivo" checked={payment === 'Efectivo'} onChange={() => setPayment('Efectivo')} /> Efectivo</label>
            <label style={{ marginLeft: 8 }}><input type="radio" name="payment" value="Transferencia" checked={payment === 'Transferencia'} onChange={() => setPayment('Transferencia')} /> Transferencia</label>
          </div>
          <div className="terms-consent" style={{ marginTop: 8 }}>
            <input type="checkbox" id="terms-consent-checkbox" checked={accepted} onChange={() => setAccepted(!accepted)} />
            <label htmlFor="terms-consent-checkbox"> Acepto los <a href="/privacy/index.html" target="_blank">Términos y Condiciones de Tratamiento de Datos</a></label>
          </div>
          <button id="finalize-btn" className="checkout-btn" onClick={submit}>Continuar</button>
        </div>
      </div>
    </div>
  )
}