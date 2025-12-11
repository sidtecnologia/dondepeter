import React from 'react'

export default function Navbar({ cartCount, onCartClick, onOpenBusiness }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Barra principal">
      <div className="navbar-left">
        <div className="brand" role="button" tabIndex={0} onClick={onOpenBusiness} onKeyDown={(e) => { if (e.key === 'Enter') onOpenBusiness() }}>
          <img src="/img/favicon.png" alt="Donde Peter" className="brand-logo" />
          <h1 className="logo">Comida Rápida</h1>
        </div>
      </div>

      <div className="navbar-center" aria-hidden="false">
        <div className="search-container" role="search" aria-label="Buscar productos">
          <input id="search-input" type="search" placeholder="Buscar producto, marca o categoría..." aria-label="Buscar productos" />
        </div>
      </div>

      <div className="navbar-right">
        <button id="cart-btn" className="nav-cart-btn" aria-label="Abrir carrito" onClick={onCartClick}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="cart-icon">
            <path d="M3 3h2l1.4 6.4a2 2 0 0 0 1.98 1.6H18a2 2 0 0 0 1.95-1.57L21.6 6H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="19" r="1.5" fill="currentColor"/>
            <circle cx="18" cy="19" r="1.5" fill="currentColor"/>
          </svg>
          <span className="cart-badge" aria-live="polite" style={{ display: cartCount > 0 ? 'inline-flex' : 'none' }}>{cartCount}</span>
        </button>
      </div>
    </nav>
  )
}