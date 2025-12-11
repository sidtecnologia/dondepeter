import React from 'react'

export default function LoadingOverlay({ open }) {
  if (!open) return null
  return (
    <div id="loading-overlay" className="loading-overlay" aria-hidden="false" style={{ display: 'flex' }}>
      <div className="loading-card">
        <div className="spinner" role="status" aria-hidden="true"><span></span></div>
        <div className="loading-text">Cargando...</div>
      </div>
    </div>
  )
}