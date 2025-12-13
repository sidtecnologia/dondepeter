import { createContext, useContext, useState, useEffect } from 'react';
import { getProducts, placeOrderAPI, saveOrderToDB } from '../services/api';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBusinessModalOpen, setBusinessModalOpen] = useState(false);

  // Toasters
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Toast helpers
  const addToast = (message, title = '') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
    const toast = { id, title, message };
    setToasts((prev) => [toast, ...prev]);
    // auto remove after 3.2s
    setTimeout(() => removeToast(id), 3200);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  /**
   * addToCart ahora acepta observation como tercer parámetro.
   * Si el producto ya existe en el carrito:
   *  - incrementa la cantidad
   *  - si se envía una nueva observación la concatena con la existente separada por " | "
   */
  const addToCart = (product, qty, observation = '') => {
    const existing = cart.find(item => item.id === product.id);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty + qty > product.stock) {
      alert(`Solo quedan ${product.stock} unidades disponibles.`);
      return;
    }

    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? {
            ...item,
            qty: item.qty + qty,
            observation: observation ?
              (item.observation ? `${item.observation} | ${observation}` : observation)
              : item.observation
          }
          : item
      ));
    } else {
      setCart([...cart, { ...product, qty, observation: observation || '' }]);
    }

    // Mostrar toast cuando se agrega
    addToast(`${product.name} agregado al carrito.`, 'Producto agregado');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const product = products.find(p => p.id === id);
    const newQty = item.qty + delta;

    if (newQty > product.stock) {
      alert(`Solo quedan ${product.stock} unidades disponibles.`);
      return;
    }

    if (newQty <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, qty: newQty } : i));
    }
  };

  const clearCart = () => setCart([]);

  /**
   * processOrder:
   * - Prepara los datos de la orden (sin persistir) para mostrar en el modal de confirmación.
   */
  const processOrder = async (customerData) => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const orderDetails = {
      name: customerData.name,
      address: customerData.address,
      payment: customerData.payment,
      items: cart,
      total
    };

    return orderDetails;
  };

  /**
   * confirmOrder:
   * - Llamar cuando el usuario CONFIRME el pedido (por ejemplo, al pulsar el botón de WhatsApp en SuccessModal).
   * - Realiza: saveOrderToDB, placeOrderAPI (para actualizar stock), refetch products y limpiar carrito.
   */
  const confirmOrder = async (orderDetails) => {
    try {
      const dbOrder = {
        customer_name: orderDetails.name,
        customer_address: orderDetails.address,
        payment_method: orderDetails.payment,
        total_amount: orderDetails.total,
        order_items: orderDetails.items, // aquí cada item incluye observation
        order_status: 'Pendiente'
      };

      await saveOrderToDB(dbOrder);
      await placeOrderAPI(orderDetails, products);

      await fetchProducts();
      clearCart();

      addToast('Pedido confirmado y enviado correctamente.', 'Pedido enviado');

      return true;
    } catch (err) {
      console.error('Error confirmando orden:', err);
      addToast('Error al confirmar el pedido: ' + (err.message || err), 'Error');
      throw err;
    }
  };

  return (
    <ShopContext.Provider value={{
      products,
      cart,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      processOrder,
      confirmOrder,
      isBusinessModalOpen,
      setBusinessModalOpen,
      // toasts
      toasts,
      addToast,
      removeToast
    }}>
      {children}
    </ShopContext.Provider>
  );
};