import React, { createContext, useContext, useEffect, useState } from 'react'
const CartContext = createContext()
export const useCart = () => useContext(CartContext)
export default function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_v1')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('cart_v1', JSON.stringify(cart))
    } catch {}
  }, [cart])
  const add = (product, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx].qty += qty
        return copy
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image?.[0] || '', qty }]
    })
  }
  const remove = id => setCart(prev => prev.filter(p => p.id !== id))
  const updateQty = (id, qty) => setCart(prev => prev.map(p => p.id === id ? { ...p, qty } : p))
  const clear = () => setCart([])
  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)
  const items = cart.reduce((s, it) => s + (it.qty || 0), 0)
  return <CartContext.Provider value={{ cart, add, remove, updateQty, clear, total, items }}>{children}</CartContext.Provider>
}