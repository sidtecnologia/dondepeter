import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { money } from '../utils/money'
export default function ProductModal({ product, open, onClose }) {
  const [qty, setQty] = useState(1)
  const { add } = useCart()
  if (!open || !product) return null
  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <button className="close" onClick={onClose}>&times;</button>
        <div style={{display:'flex',gap:18}}>
          <img src={product.image?.[0] || '/img/favicon.png'} alt={product.name} style={{width:260,height:200,objectFit:'cover',borderRadius:10}} />
          <div style={{flex:1}}>
            <h3 style={{margin:0}}>{product.name}</h3>
            <p style={{color:'#9aa4b2'}}>{product.description}</p>
            <p style={{fontWeight:800,color:'#00d983'}}>${money(product.price)}</p>
            <div className="form-row" style={{marginTop:12}}>
              <input className="qty" type="number" min="1" value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} />
              <button className="cart-btn" onClick={() => { if ((product.stock || 0) < qty) { alert(`Solo quedan ${(product.stock||0)} unidades`) ; return } add(product, qty); onClose() }}>Añadir</button>
            </div>
            <p style={{color:'#9aa4b2',marginTop:10}}>Stock: {product.stock ?? 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}