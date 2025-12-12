import React from 'react'
export default function Header({ onLogoClick, items }) {
  return (
    <header className="header" role="banner">
      <button className="logo-btn" onClick={onLogoClick} aria-label="Información del negocio">
        <img className="logo-img" src="/img/favicon.png" alt="logo" />
        <h1 className="app-title">Comida Rápida</h1>
      </button>
      <div className="search-wrap">
        <input id="search" className="search" placeholder="Buscar producto, marca o categoría..." />
      </div>
      <div className="actions">
        <button className="cart-btn" aria-label="Ver carrito">
          Carrito
          <span className="cart-badge" aria-hidden="true">{items}</span>
        </button>
      </div>
    </header>
  )
}