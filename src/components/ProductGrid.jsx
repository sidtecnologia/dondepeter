import React from 'react'
import ProductCard from './ProductCard'
export default function ProductGrid({ products, onOpen }) {
  return <section className="grid" aria-live="polite">{products.map(p => <ProductCard key={p.id} product={p} onOpen={onOpen} />)}</section>
}