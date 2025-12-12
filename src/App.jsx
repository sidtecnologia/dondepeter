import React, { useEffect, useMemo, useState } from 'react'
import useSupabaseConfig from './hooks/useSupabaseConfig'
import CartProvider, { useCart } from './contexts/CartContext'
import Header from './components/Header'
import LogoModal from './components/LogoModal'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import CartModal from './components/CartModal'
import CheckoutModal from './components/CheckoutModal'
import OrderSuccessModal from './components/OrderSuccessModal'
export default function AppRoot() {
  return <CartProvider><App /></CartProvider>
}
function App() {
  const { client, loading, error } = useSupabaseConfig()
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [logoOpen, setLogoOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)
  const { items, clear } = useCart()
  useEffect(() => {
    const el = document.getElementById('search')
    const handler = e => setQuery(e.target.value.toLowerCase().trim())
    el && el.addEventListener('input', handler)
    return () => el && el.removeEventListener('input', handler)
  }, [])
  useEffect(() => {
    let mounted = true
    if (!client) return
    client.from('products').select('*').then(res => {
      if (!mounted) return
      if (res.error) return
      setProducts(res.data || [])
    }).catch(()=>{})
    return () => { mounted = false }
  }, [client])
  const filtered = useMemo(() => {
    if (!query) return products
    return products.filter(p => (p.name||'').toLowerCase().includes(query) || (p.description||'').toLowerCase().includes(query) || (p.category||'').toLowerCase().includes(query))
  }, [products, query])
  const openProduct = p => { setSelected(p); window.scrollTo({top:0,behavior:'smooth'}) }
  const { clear: clearCart } = useCart()
  const finalize = async (info) => {
    const cartState = JSON.parse(localStorage.getItem('cart_v1') || '[]')
    const payload = { orderDetails: { name: info.name, address: info.address, payment: info.payment, items: cartState, total: cartState.reduce((s,i)=>s + (i.price||0)*(i.qty||0),0) }, products }
    try {
      const r = await fetch('/api/place-order', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error('Error al procesar orden')
      const json = await r.json()
      setOrderDetails(payload.orderDetails)
      clearCart()
      setCheckoutOpen(false)
      setCartOpen(false)
      setSuccessOpen(true)
    } catch (err) {
      alert('Error al procesar el pedido: ' + (err.message || err))
    }
  }
  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Cargando aplicación...</div>
  if (error) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'tomato'}}>ERROR: {error}</div>
  return (
    <main className="app">
      <Header onLogoClick={() => setLogoOpen(true)} items={items} />
      <ProductGrid products={filtered} onOpen={openProduct} />
      <LogoModal open={logoOpen} onClose={() => setLogoOpen(false)} />
      <ProductModal product={selected} open={!!selected} onClose={() => setSelected(null)} />
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCheckoutOpen(true); setCartOpen(false) }} products={products} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onFinalize={finalize} />
      <OrderSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} details={orderDetails} />
      <footer className="footer">© {new Date().getFullYear()} Tecsin. Todos los derechos reservados.</footer>
    </main>
  )
}