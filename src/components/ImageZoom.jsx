import React from 'react'

export default function ImageZoom({ src, onClose }) {
  if (!src) return null
  function onOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }
  return (
    <div id="imageZoomOverlay" className="image-zoom-overlay" style={{ display: 'flex' }} aria-hidden="false" onClick={onOverlayClick}>
      <div className="image-zoom-wrapper">
        <button className="zoom-close" aria-label="Cerrar" onClick={onClose}>&times;</button>
        <img id="imageZoomImg" src={src} alt="Imagen ampliada" />
        <div className="zoom-hint"></div>
      </div>
    </div>
  )
}