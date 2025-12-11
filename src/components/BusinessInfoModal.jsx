import React from 'react'

export default function BusinessInfoModal({ open, onClose, info }) {
  if (!open) return null
  function onOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }
  return (
    <div className="modal" style={{ display: 'flex' }} aria-hidden="false" role="dialog" aria-modal="true" aria-label="Información del negocio" onClick={onOverlayClick}>
      <div className="modal-content-wrapper">
        <div className="checkout-modal-card business-modal">
          <button className="modal-close" aria-label="Cerrar" onClick={onClose}>&times;</button>
          <div className="business-header">
            <img src={info.logo} alt={info.name} className="business-logo" />
            <div className="business-title">
              <h2>{info.name}</h2>
              <p className="business-sub">{info.address}</p>
            </div>
          </div>
          <div className="business-grid">
            <div className="business-row">
              <i className="fas fa-phone icon"></i>
              <a href={`tel:${info.phone}`} className="business-link">{info.phone}</a>
            </div>
            <div className="business-row">
              <i className="fas fa-map-marker-alt icon"></i>
              <span className="business-text">{info.address}</span>
            </div>
            <div className="business-row">
              <i className="fas fa-clock icon"></i>
              <span className="business-text">{info.hours}</span>
            </div>
            <div className="business-actions">
              <a href={`https://wa.me/573227671829`} target="_blank" rel="noreferrer" className="add-to-cart-btn whatsapp-btn">
                <i className="fab fa-whatsapp"></i>
                <span>Contactar por WhatsApp</span>
              </a>
              <button className="add-to-cart-btn close-btn" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}