import React, { useState, useEffect } from 'react'
import { money } from '../utils/money.js'

export default function ProductModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1)
  const [images, setImages] = useState([])

  useEffect(() => {
    if (product) {
      setQty(1)
      setImages(product.image || [])
      setTimeout(() => {
        const el = document.getElementById('carousel-images-container')
        if (!el) return
        const imgs = el.querySelectorAll('.carousel-image')
        imgs.forEach((im, i) => im.style.display = i === 0 ? '' : 'none')
      }, 0)
    }
  }, [product])

  if (!product) return null

  function onOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function prevImage() {
    const el = document.getElementById('carousel-images-container')
    if (!el) return
    const imgs = el.querySelectorAll('.carousel-image')
    if (imgs.length === 0) return
    const currentIndex = Array.from(imgs).findIndex(i => i.style.display !== 'none' && i.style.display !== '')
    const idx = Math.max(0, currentIndex - 1)
    imgs.forEach((im, i) => im.style.display = i === idx ? '' : 'none')
  }

  function nextImage() {
    const el = document.getElementById('carousel-images-container')
    if (!el) return
    const imgs = el.querySelectorAll('.carousel-image')
    if (imgs.length === 0) return
    const currentIndex = Array.from(imgs).findIndex(i => i.style.display !== 'none' && i.style.display !== '')
    const idx = Math.min(imgs.length - 1, currentIndex + 1)
    imgs.forEach((im, i) => im.style.display = i === idx ? '' : 'none')
  }

  return (
    <div id="productModal" className="modal" style={{ display: 'flex' }} aria-hidden="false" onClick={onOverlayClick}>
      <div className="modal-content-wrapper">
        <div className="modal-card">
          <button className="modal-close close-button" aria-label="Cerrar" onClick={onClose}>&times;</button>
          <div className="carousel-container" aria-live="polite">
            <button id="prev-btn" className="carousel-btn prev-btn" aria-label="Anterior" onClick={prevImage}><i className="fas fa-circle-arrow-left"></i></button>
            <div id="carousel-images-container" className="carousel-images-container" role="list">
              {images.length === 0 ? <div className="carousel-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f3f3' }}>Sin imagen</div> : images.map((src, idx) => <img key={idx} src={src} className="carousel-image" loading="lazy" style={{ display: idx === 0 ? '' : 'none' }} alt="" />)}
            </div>
            <button id="next-btn" className="carousel-btn next-btn" aria-label="Siguiente" onClick={nextImage}><i className="fas fa-circle-arrow-right"></i></button>
          </div>
          <div className="modal-caption">
            <h3 id="modal-product-name">{product.name}</h3>
            <p id="modal-product-description">{product.description}</p>
            <p id="modal-product-price" className="price">${money(product.price)}</p>
            <div className="qty-row">
              <label htmlFor="qty-input">Cantidad</label>
              <input id="qty-input" type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
            <button id="modal-add-to-cart-btn" className="add-to-cart-btn" onClick={() => onAdd(product.id, qty)}>Añadir al carrito</button>
          </div>
        </div>
      </div>
    </div>
  )
}