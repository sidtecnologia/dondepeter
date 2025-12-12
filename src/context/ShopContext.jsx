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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, qty) => {
    const existing = cart.find(item => item.id === product.id);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty + qty > product.stock) {
      alert(`Solo quedan ${product.stock} unidades disponibles.`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, qty: item.qty + qty } : item
      ));
    } else {
      setCart([...cart, { ...product, qty }]);
    }
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

  const processOrder = async (customerData) => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const orderDetails = {
      name: customerData.name,
      address: customerData.address,
      payment: customerData.payment,
      items: cart,
      total
    };

    const dbOrder = {
      customer_name: customerData.name,
      customer_address: customerData.address,
      payment_method: customerData.payment,
      total_amount: total,
      order_items: cart,
      order_status: 'Pendiente'
    };

    await saveOrderToDB(dbOrder);
    await placeOrderAPI(orderDetails, products);
    
    // Refetch products to update stock in UI
    await fetchProducts();
    
    return orderDetails;
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
      isBusinessModalOpen, 
      setBusinessModalOpen
    }}>
      {children}
    </ShopContext.Provider>
  );
};