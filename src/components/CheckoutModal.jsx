import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
export default function CheckoutModal({ open, onClose, onFinalize }) {
  const { total } = useCart()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState('Efectivo')
  const [consent, setConsent] = useState(false)
  if (!open) return null
  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <button className="close" onClick={onClose}>&times;</button>
        <h3>Datos de entrega</h3>
        <div style={{display:'grid',gap:8}}>
          <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Dirección" value={address} onChange={e => setAddress(e.target.value)} />
          <div>
            <label><input type="radio" name="pm" checked={payment==='Efectivo'} onChange={()=>setPayment('Efectivo')} /> Efectivo</label>
            <label style={{marginLeft:8}}><input type="radio" name="pm" checked={payment==='Transferencia'} onChange={()=>setPayment('Transferencia')} /> Transferencia</label>
          </div>
          <label style={{fontSize:13,color:'#9aa4b2'}}><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> Acepto Términos y Política de Privacidad</label>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>Total: ${Math.floor(total).toLocaleString('es-CO')}</div>
            <div style={{display:'flex',gap:8}}>
              <button className="cart-btn" onClick={() => {
                if (!consent) { alert('Debe aceptar la política'); return }
                if (!name || !address) { alert('Complete nombre y dirección'); return }
                onFinalize({ name, address, payment })
              }}>Continuar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}