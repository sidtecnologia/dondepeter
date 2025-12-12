import React from 'react'
import { money } from '../utils/money'
export default function ProductCard({ product, onOpen }) {
  return (
    <article className="card" aria-labelledby={`p-${product.id}`}>
      <img className="product-image" src={product.image?.[0] || '/img/favicon.png'} alt={product.name} loading="lazy" onClick={() => onOpen(product)} />
      <div>
        <div className="meta">
          <div>
            <div id={`p-${product.id}`} className="name">{product.name}</div>
            <div className="desc">{product.description}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="price">${money(product.price)}</div>
            {!product.stock || product.stock <= 0 ? <div className="badge">Agotado</div> : null}
          </div>
        </div>
      </div>
    </article>
  )
}