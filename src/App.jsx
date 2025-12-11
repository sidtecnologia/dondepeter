import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import BannerCarousel from './components/BannerCarousel.jsx'
import Navbar from './components/Navbar.jsx'
import CategoryCarousel from './components/CategoryCarousel.jsx'
import ProductGrid from './components/ProductGrid.jsx'
import ProductModal from './components/ProductModal.jsx'
import CartModal from './components/CartModal.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'
import OrderSuccessModal from './components/OrderSuccessModal.jsx'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import ImageZoom from './components/ImageZoom.jsx'
import BusinessInfoModal from './components/BusinessInfoModal.jsx'
import { money } from './utils/money.js'

export default function App() {
  const [sbUrl, setSbUrl] = useState(null)
  const [sbAnonKey, setSbAnonKey] = useState(null)
  const [supabase, setSupabase] = useState(null)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [currentProduct, setCurrentProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderDetails, setOrderDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false)
  const [imageZoomSrc, setImageZoomSrc] = useState('')
  const [businessOpen, setBusinessOpen] = useState(false)
  const featuredRef = useRef(null)
  const offersRef = useRef(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const resp = await fetch('/api/get-config')
      if (!resp.ok) throw new Error('Missing config')
      const config = await resp.json()
      if (!config.url || !config.anonKey) throw new Error('Missing keys')
      setSbUrl(config.url)
      setSbAnonKey(config.anonKey)
      const client = createClient(config.url, config.anonKey)
      setSupabase(client)
      const { data, error } = await client.from('products').select('*')
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function refreshProducts() {
    if (!supabase) return
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  function addToCart(productId, qty = 1) {
    const p = products.find(x => x.id === productId)
    if (!p) return
    const available = p.stock || 0
    const existing = cart.find(i => i.id === productId)
    const inCartQty = existing ? existing.qty : 0
    if (inCartQty + qty > available) {
      alert(`En el momento solo quedan ${available} unidades.`)
      return
    }
    if (existing) {
      setCart(cart.map(it => it.id === productId ? { ...it, qty: it.qty + qty } : it))
    } else {
      setCart([...cart, { id: p.id, name: p.name, price: p.price, qty, image: p.image && p.image[0] }])
    }
  }

  function updateCartItem(idx, op) {
    const copy = [...cart]
    if (!copy[idx]) return
    if (op === 'inc') {
      const prod = products.find(p => p.id === copy[idx].id)
      if ((copy[idx].qty + 1) > (prod.stock || 0)) {
        alert(`En el momento solo quedan ${prod.stock} unidades.`)
        return
      }
      copy[idx].qty++
    } else {
      copy[idx].qty--
      if (copy[idx].qty <= 0) copy.splice(idx, 1)
    }
    setCart(copy)
  }

  function openProductModal(id) {
    const p = products.find(x => x.id === id)
    if (!p) return
    setCurrentProduct(p)
  }

  function closeProductModal() {
    setCurrentProduct(null)
  }

  function openCart() {
    setShowCart(true)
  }
  function closeCart() {
    setShowCart(false)
  }

  function openCheckout() {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }
    setShowCheckout(true)
  }
  function closeCheckout() {
    setShowCheckout(false)
  }

  function finalizeOrder(details) {
    const total = cart.reduce((acc, it) => acc + it.price * it.qty, 0)
    const payload = {
      name: details.name,
      address: details.address,
      payment: details.payment,
      items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
      total
    }
    setOrderDetails(payload)
    setShowCheckout(false)
    setShowCart(false)
    setOrderSuccessOpen(true)
  }

  async function confirmAndSendToWhatsapp() {
    if (!supabase) {
      alert('El cliente no está inicializado. Inténtalo de nuevo.')
      return
    }
    try {
      await supabase.from('orders').insert([{
        customer_name: orderDetails.name,
        customer_address: orderDetails.address,
        payment_method: orderDetails.payment,
        total_amount: orderDetails.total,
        order_items: orderDetails.items,
        order_status: 'Pendiente'
      }])
      await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderDetails, products })
      })
      let message = `Hola mi nombre es ${orderDetails.name}.He realizado un pedido para la dirección ${orderDetails.address}. Detalles: `
      orderDetails.items.forEach(item => {
        message += `---- ${item.name} x${item.qty} = $${money(item.price * item.qty)} `
      })
      message += `Total: $${money(orderDetails.total)}`
      const link = `https://wa.me/573227671829?text=${encodeURIComponent(message)}`
      window.open(link, '_blank')
      setCart([])
      setOrderDetails({})
      await refreshProducts()
      setOrderSuccessOpen(false)
    } catch (err) {
      alert('Error al procesar el pedido: ' + (err.message || err))
    }
  }

  function openImageZoom(src) {
    setImageZoomSrc(src)
  }

  function closeImageZoom() {
    setImageZoomSrc('')
  }

  const businessInfo = {
    name: 'Donde Peter',
    address: 'Carrera 27 # 10-50, Bucaramanga, Santander, CO',
    phone: '+57 322 767 1829',
    hours: 'Lun-Dom 17:00 - 23:00',
    logo: '/img/favicon.png'
  }

  return (
    <div>
      <Navbar
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        onCartClick={openCart}
        onOpenBusiness={() => setBusinessOpen(true)}
      />
      <div className="page-container">
        <BannerCarousel />
        <div className="ticker-wrapper">
          <div className="ticker-text">
            <span>Donde Peter APP</span>
            <span>Envío Gratis En Compras Superiores A $150.000 ✨</span>
            <span>Descuentos Del 20% En Productos Seleccionados solo En Nuestra App 🔥</span>
            <span>Nuevos Productos Ya Disponibles 🚀</span>
          </div>
        </div>
        <nav className="menu-container">
          <CategoryCarousel products={products} onSelectCategory={(cat) => {
            if (cat === '__all') {
              featuredRef.current?.showDefault()
            } else {
              featuredRef.current?.filterByCategory(cat)
            }
          }} />
        </nav>
        <main className="menu-container">
          <section id="filtered-section" className="menu-section" style={{ display: 'none' }}>
          </section>
          <section id="featured-section" className="menu-section">
            <h2 className="section-title">Productos Destacados</h2>
            <ProductGrid ref={featuredRef} products={products} type="featured" onOpenProduct={openProductModal} onAddToCart={addToCart} onOpenImage={openImageZoom} />
          </section>
          <section id="ads-section" className="ads-section">
            <div className="ads-grid">
              <img src="https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/favicon.png" alt="Publicidad" className="ad-image" />
            </div>
          </section>
          <section id="offers-section" className="menu-section">
            <h2 className="section-title">Ofertas Exclusivas</h2>
            <ProductGrid ref={offersRef} products={products} type="offers" onOpenProduct={openProductModal} onAddToCart={addToCart} onOpenImage={openImageZoom} />
          </section>
        </main>
        <footer className="footer-menu">
          <p>&copy; <span id="year">{new Date().getFullYear()}</span> Donde Peter. Todos los derechos reservados.</p>
        </footer>
      </div>
      <ProductModal product={currentProduct} onClose={closeProductModal} onAdd={(id, qty) => { addToCart(id, qty); closeProductModal() }} />
      <CartModal open={showCart} onClose={closeCart} cart={cart} onInc={(i) => updateCartItem(i, 'inc')} onDec={(i) => updateCartItem(i, 'dec')} total={cart.reduce((acc, it) => acc + it.price * it.qty, 0)} onCheckout={() => { closeCart(); openCheckout() }} />
      <CheckoutModal open={showCheckout} onClose={closeCheckout} onFinalize={finalizeOrder} />
      <OrderSuccessModal open={orderSuccessOpen} onClose={() => setOrderSuccessOpen(false)} orderDetails={orderDetails} onConfirm={confirmAndSendToWhatsapp} />
      <LoadingOverlay open={loading} />
      <ImageZoom src={imageZoomSrc} onClose={closeImageZoom} />
      <BusinessInfoModal open={businessOpen} onClose={() => setBusinessOpen(false)} info={businessInfo} />
    </div>
  )
}