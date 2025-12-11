import React from 'react'

export default function Navbar({ cartCount, onCartClick, onOpenBusiness }) {
  return (
    <nav className="navbar">
      <div className="brand" role="button" tabIndex={0} onClick={onOpenBusiness} onKeyDown={(e) => { if (e.key === 'Enter') onOpenBusiness() }}>
        <img src="/img/favicon.png" alt="Donde Peter" className="brand-logo" />
        <h1 className="logo">Comida Rápida</h1>
      </div>
      <div className="search-container">
        <input id="search-input" type="search" placeholder="Buscar producto, marca o categoría..." />
      </div>
      <button id="cart-btn" className="nav-cart-btn" aria-label="Abrir carrito" onClick={onCartClick}>
        <i className="fas fa-shopping-cart" aria-hidden="true"></i>
        <span id="cart-badge" className="cart-badge" style={{ display: cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
      </button>
    </nav>
  )
}