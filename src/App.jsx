import { useState, useMemo } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import SuccessModal from './components/SuccessModal';
import BusinessModal from './components/BusinessModal';
import { Loader2 } from 'lucide-react';

const Categories = ({ categories, selected, onSelect }) => (
  <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide">
    <button 
      onClick={() => onSelect('Todo')}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selected === 'Todo' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
    >
      <span className="font-semibold">Todo</span>
    </button>
    {categories.map(cat => (
      <button 
        key={cat}
        onClick={() => onSelect(cat)}
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selected === cat ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
      >
        <span className="font-semibold whitespace-nowrap">{cat}</span>
      </button>
    ))}
  </div>
);

const Banner = () => (
  <div className="w-full overflow-hidden rounded-2xl shadow-lg mb-8 relative group">
    <div className="flex animate-carousel">
        {/* Simulación visual del carrusel original, en producción usar librería tipo Embla o Swiper */}
        <img src="https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner1.webp" className="w-full object-cover min-h-[150px] md:min-h-[300px]" alt="Banner" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
      <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">Las Mejores Hamburguesas</h2>
    </div>
  </div>
);

const StoreContent = () => {
  const { products, loading, error } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todo');
  const [activeProduct, setActiveProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Derivar categorías y productos filtrados
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todo' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const featured = useMemo(() => products.filter(p => p.featured), [products]);
  const offers = useMemo(() => products.filter(p => p.isOffer), [products]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-primary">
      <Loader2 className="animate-spin w-12 h-12" />
      <p className="font-semibold animate-pulse">Cargando menú...</p>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;

  const showSections = searchTerm === '' && selectedCategory === 'Todo';

  return (
    <div className="min-h-screen pb-20">
      <Navbar onSearch={setSearchTerm} onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Banner />
        
        <Categories 
          categories={categories} 
          selected={selectedCategory} 
          onSelect={setSelectedCategory} 
        />

        <div className="mt-8">
          {showSections ? (
            <>
              {featured.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-8 bg-primary rounded-full"></span>
                    Destacados
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featured.map(p => <ProductCard key={p.id} product={p} onClick={setActiveProduct} />)}
                  </div>
                </section>
              )}
              
              {offers.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-8 bg-yellow-400 rounded-full"></span>
                    Ofertas Exclusivas
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {offers.map(p => <ProductCard key={p.id} product={p} onClick={setActiveProduct} />)}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-700">Resultados ({filteredProducts.length})</h2>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No se encontraron productos.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(p => <ProductCard key={p.id} product={p} onClick={setActiveProduct} />)}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Comida Rápida. Todos los derechos reservados.</p>
      </footer>

      {/* Modales */}
      <ProductModal 
        product={activeProduct} 
        isOpen={!!activeProduct} 
        onClose={() => setActiveProduct(null)} 
      />
      
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(details) => setSuccessOrder(details)}
      />

      <SuccessModal 
        isOpen={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        orderDetails={successOrder}
      />

      <BusinessModal />
    </div>
  );
};

const App = () => (
  <ShopProvider>
    <StoreContent />
  </ShopProvider>
);

export default App;