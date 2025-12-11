import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { money } from '../utils/money.js'

const ProductGrid = forwardRef(({ products, type, onOpenProduct, onAddToCart, onOpenImage }, ref) => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const perPage = type === 'featured' ? 25 : 25

  useEffect(() => {
    if (!products) return
    if (type === 'featured') {
      const f = (products || []).filter(p => p.featured)
      setData(shuffle(f).slice(0, 25))
    } else if (type === 'offers') {
      const f = (products || []).filter(p => p.isOffer)
      setData(shuffle(f).slice(0, 25))
    } else {
      setData(products || [])
    }
  }, [products, type])

  useImperativeHandle(ref, () => ({
    showDefault() {
      setPage(1)
      if (type === 'featured') {
        const f = (products || []).filter(p => p.featured)
        setData(shuffle(f).slice(0, 25))
      } else {
        setData(products || [])
      }
    },
    filterByCategory(cat) {
      const filtered = (products || []).filter(p => p.category.toLowerCase() === cat.toLowerCase())
      setData(filtered)
      setPage(1)
    }
  }))

  function shuffle(arr) {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = a[i]
      a[i] = a[j]
      a[j] = tmp
    }
    return a
  }

  const totalPages = Math.ceil((data || []).length / perPage)
  const start = (page - 1) * perPage
  const pageItems = (data || []).slice(start, start + perPage)

  return (
    <>
      <div className="product-grid" id={type === 'featured' ? 'featured-grid' : (type === 'offers' ? 'offers-grid' : 'all-filtered-products')}>
        {pageItems.map(p => {
          const out = (!p.stock || p.stock <= 0)
          return (
            <div className={`product-card${out ? ' out-of-stock' : ''}`} key={p.id} data-product-id={p.id}>
              {p.bestSeller ? <div className="best-seller-tag">Lo más vendido</div> : null}
              <div className="image-wrap">
                <img src={p.image && p.image[0]} alt={p.name} className="product-image modal-trigger" loading="lazy" onClick={() => onOpenProduct(p.id)} />
                <div className="image-hint" aria-hidden="true">
                  <i className="fas fa-hand-point-up" aria-hidden="true"></i>
                  <span>Presiona para ver</span>
                </div>
              </div>
              {out ? <div className="out-of-stock-overlay">Agotado</div> : null}
              <div className="product-info">
                <div>
                  <div className="product-name">{p.name}</div>
                  <div className="product-description">{p.description}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div className="product-price">${money(p.price)}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <button className="add-to-cart-btn" onClick={() => onAddToCart(p.id, 1)} disabled={out}>Añadir al carrito</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div id="pagination-container" style={{ display: totalPages > 1 ? 'flex' : 'none' }}>
        {page > 1 ? <button className="pagination-btn" onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Primera</button> : null}
        {page > 3 ? <span>...</span> : null}
        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          const p = Math.max(1, page - 2) + i
          if (p > totalPages) return null
          return <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>{p}</button>
        })}
        {page < totalPages - 2 ? <span>...</span> : null}
        {page < totalPages ? <button className="pagination-btn" onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Última</button> : null}
      </div>
    </>
  )
})

export default ProductGrid