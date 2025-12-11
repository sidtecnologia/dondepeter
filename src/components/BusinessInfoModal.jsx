import React from 'react'

export default function BusinessInfoModal({ open, onClose, info }) {
  if (!open) return null
  function onOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }
  return (
    <div className="modal" style={{ display: 'flex' }} aria-hidden="false" role="dialog" aria-modal="true" onClick={onOverlayClick}>
      <div className="modal-content-wrapper">
        <div className="checkout-modal-card business-modal">
          <button className="modal-close" aria-label="Cerrar" onClick={onClose}>&times;</button>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', padding: '12px 6px 6px 6px' }}>
            <img src={info.logo} alt={info.name} style={{ width: 78, height: 78, borderRadius: 12, objectFit: 'cover', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }} />
            <div>
              <h2 style={{ margin: 0, color: 'var(--primary)' }}>{info.name}</h2>
              <p style={{ margin: 0, color: '#555' }}>{info.address}</p>
            </div>
          </div>
          <div style={{ padding: '6px 12px 18px 12px', display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <i className="fas fa-phone" style={{ color: 'var(--primary)', minWidth: 22 }}></i>
              <a href={`tel:${info.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{info.phone}</a>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)', minWidth: 22 }}></i>
              <span>{info.address}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <i className="fas fa-clock" style={{ color: 'var(--primary)', minWidth: 22 }}></i>
              <span>{info.hours}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <a href={`https://wa.me/573227671829`} target="_blank" rel="noreferrer" className="add-to-cart-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <i className="fab fa-whatsapp"></i>
                <span>Contactar por WhatsApp</span>
              </a>
              <button className="add-to-cart-btn" onClick={onClose} style={{ background: '#666' }}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}