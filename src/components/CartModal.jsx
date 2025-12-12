import React from 'react'
import { useCart } from '../contexts/CartContext'
import { money } from '../utils/money'
export default function CartModal({ open, onClose, onCheckout, products }) {
  const { cart, remove, updateQty, total } = useCart()
  if (!open) return null
  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <button className="close" onClick={onClose}>&times;</button>
        <h3>Tu Pedido</h3>
        {cart.length === 0 ? <p style={{color:'#9aa4b2'}}>Aún no hay pedido.</p> : null}
        <div style={{display:'grid',gap:10}}>
          {cart.map((it, idx) => {
            const original = (products || []).find(p => p.id === it.id) || {}
            return (
              <div key={it.id} style={{display:'flex',alignItems:'center',gap:12}}>
                <img src={it.image || '/img/favicon.png'} alt={it.name} style={{width:56,height:56,objectFit:'cover',borderRadius:8}} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:700}}>{it.name}</div>
                  <div style={{color:'#9aa4b2',fontSize:13}}>${money(it.price)}</div>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <button onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))} className="cart-btn">-</button>
                  <div style={{minWidth:28,textAlign:'center'}}>{it.qty}</div>
                  <button onClick={() => { if ((original.stock||0) <= it.qty) { alert(`Solo quedan ${(original.stock||0)} unidades`) ; return } updateQty(it.id, it.qty + 1) }} className="cart-btn">+</button>
                </div>
                <button onClick={() => remove(it.id)} style={{background:'transparent',border:0,color:'#ff7b7b'}}>Eliminar</button>
              </div>
            )
          })}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
          <strong>Total: ${money(total)}</strong>
          <div style={{display:'flex',gap:8}}>
            <button className="cart-btn" onClick={() => { onCheckout() }}>Hacer Pedido</button>
          </div>
        </div>
      </div>
    </div>
  )
}