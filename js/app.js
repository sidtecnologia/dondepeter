const { createClient } = supabase;

let SB_URL = null;
let SB_ANON_KEY = null;
let supabaseClient = null;

let cart = [];
let products = [];
let currentImageIndex = 0;
let currentProduct = null;
let deferredPrompt = null;
const PRODUCTS_PER_PAGE = 25;
let orderDetails = {};

const loadingOverlay = document.getElementById('loading-overlay');
const featuredContainer = document.getElementById('featured-grid');
const offersGrid = document.getElementById('offers-grid');
const allFilteredContainer = document.getElementById('all-filtered-products');
const featuredSection = document.getElementById('featured-section');
const offersSection = document.getElementById('offers-section');
const filteredSection = document.getElementById('filtered-section');
const noProductsMessage = document.getElementById('no-products-message');
const searchInput = document.getElementById('search-input');
const searchResultsTitle = document.getElementById('search-results-title');
const categoryCarousel = document.getElementById('category-carousel');
const bannerCarousel = document.getElementById('banner-carousel');
const bannerDotsContainer = document.getElementById('banner-dots');
const productModal = document.getElementById('productModal');
const modalCloseBtn = productModal ? productModal.querySelector('.close-button') : null;
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = cartModal ? cartModal.querySelector('.close-cart-btn') : null;
const cartBadge = document.getElementById('cart-badge');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const carouselImagesContainer = document.getElementById('carousel-images-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const modalProductName = document.getElementById('modal-product-name');
const modalProductDescription = document.getElementById('modal-product-description');
const modalProductPrice = document.getElementById('modal-product-price');
const qtyInput = document.getElementById('qty-input');
const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
const installBanner = document.getElementById('install-banner');
const installPromptBtn = document.getElementById('install-prompt-btn');
const installCloseBtn = document.getElementById('install-close-btn');
const successModal = document.getElementById('successModal');
const closeSuccessBtn = document.querySelectorAll('.close-success-btn');
const orderSuccessTotal = document.getElementById('order-success-total');
const orderSuccessDescription = document.getElementById('order-success-description');
const whatsappBtn = document.getElementById('whatsapp-btn');
const closeSuccessFinalBtn = document.getElementById('close-success-btn');
const imageZoomOverlay = document.getElementById('image-zoom-overlay');
const imageZoomImg = document.getElementById('image-zoom-img');
const zoomCloseBtn = imageZoomOverlay ? imageZoomOverlay.querySelector('.zoom-close') : null;

// --- Funciones de Utilidad ---
const showLoading = () => {
    loadingOverlay.classList.remove('hidden');
};

const hideLoading = () => {
    loadingOverlay.classList.add('hidden');
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
};

const truncateDescription = (text, maxLines = 3) => {
    const lines = text.split('\n');
    if (lines.length > maxLines) {
        return lines.slice(0, maxLines).join('\n') + '...';
    }

    const tempDiv = document.createElement('div');
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    tempDiv.style.height = 'auto';
    tempDiv.style.width = '250px';
    tempDiv.style.fontSize = '0.9rem';
    tempDiv.style.lineHeight = '1.4';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.textContent = text;
    document.body.appendChild(tempDiv);

    const lineHeight = parseFloat(getComputedStyle(tempDiv).lineHeight);
    const maxHeight = lineHeight * maxLines;

    if (tempDiv.offsetHeight > maxHeight) {
        let truncated = text;
        while (tempDiv.offsetHeight > maxHeight && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
            tempDiv.textContent = truncated + '...';
        }
        document.body.removeChild(tempDiv);
        return truncated.slice(0, -3).trim() + '...';
    }

    document.body.removeChild(tempDiv);
    return text;
};


// --- Funciones de Renderizado ---
const createProductCard = (product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';

    const img = document.createElement('img');
    img.src = product.images[0]?.url || 'https://via.placeholder.com/400x300?text=Sin+Imagen';
    img.alt = product.name;
    imageContainer.appendChild(img);

    const info = document.createElement('div');
    info.className = 'product-info';

    const name = document.createElement('h3');
    name.textContent = product.name;

    // Usar la clase para truncamiento a 3 líneas
    const descriptionShort = document.createElement('p');
    descriptionShort.className = 'product-description-short';
    descriptionShort.textContent = product.description;

    info.appendChild(name);
    info.appendChild(descriptionShort);

    // Precio fijo en la parte inferior
    const priceFixed = document.createElement('div');
    priceFixed.className = 'product-price-fixed';
    priceFixed.innerHTML = `Precio: <span class="price">${formatPrice(product.price)}</span>`;

    card.appendChild(imageContainer);
    card.appendChild(info);
    card.appendChild(priceFixed);

    card.addEventListener('click', () => openProductModal(product.id));
    return card;
};

const renderProducts = (productsToRender, container) => {
    container.innerHTML = '';
    if (!productsToRender || productsToRender.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">No hay productos disponibles.</p>';
        return;
    }
    productsToRender.forEach(product => {
        container.appendChild(createProductCard(product));
    });
};

const createCategoryItem = (category) => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.dataset.category = category.id;

    const img = document.createElement('img');
    img.src = category.icon_url || 'https://via.placeholder.com/50';
    img.alt = category.name;

    const name = document.createElement('p');
    name.textContent = category.name;

    item.appendChild(img);
    item.appendChild(name);

    item.addEventListener('click', () => filterByCategory(category.id));
    return item;
};

const renderCategories = (categories) => {
    categoryCarousel.innerHTML = '';
    // Botón para mostrar todos
    const allItem = document.createElement('div');
    allItem.className = 'category-item active';
    allItem.dataset.category = 'all';
    allItem.innerHTML = '<img src="https://via.placeholder.com/50?text=Todo" alt="Todas las categorías"><p>Todo</p>';
    allItem.addEventListener('click', showAllProducts);
    categoryCarousel.appendChild(allItem);

    categories.forEach(category => {
        categoryCarousel.appendChild(createCategoryItem(category));
    });
};

const updateCarousel = () => {
    if (!currentProduct || !carouselImagesContainer) return;
    const offset = -currentImageIndex * 100;
    carouselImagesContainer.style.transform = `translateX(${offset}%)`;
    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === currentProduct.images.length - 1;
};

// --- Manejo del Carrito ---
const updateCartBadge = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
};

const updateCartModal = () => {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
        cartTotalSpan.textContent = '0';
        checkoutBtn.disabled = true;
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';

        cartItemDiv.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">(${item.quantity}x)</span>
            </div>
            <span class="item-price">${formatPrice(itemTotal)}</span>
            <button class="remove-btn" data-id="${item.id}" aria-label="Eliminar de carrito">&times;</button>
        `;

        cartItemsContainer.appendChild(cartItemDiv);
    });

    cartTotalSpan.textContent = formatPrice(total);
    checkoutBtn.disabled = false;

    // Add event listeners for remove buttons
    cartItemsContainer.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const idToRemove = e.target.dataset.id;
            removeFromCart(idToRemove);
        });
    });
};

const addToCart = (product, quantity) => {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    updateCartBadge();
    updateCartModal();
    closeModal(productModal);
};

const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    updateCartBadge();
    updateCartModal();
};

const clearCart = () => {
    cart = [];
    updateCartBadge();
    updateCartModal();
};

// --- Supabase y Fetching de Datos ---
const initializeSupabase = () => {
    SB_URL = "https://ndqzyplsiqigsynweihk.supabase.co";
    SB_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcXp5cGxzaXFpZ3N5bndlaWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ1NTkwNzMsImV4cCI6MjAyMDEzNTA3M30.40Jb_K4f3F-U_Wn97e7YQ61sS0z8P2zE0tG0O1vN3c0";
    supabaseClient = createClient(SB_URL, SB_ANON_KEY);
};

const fetchProducts = async () => {
    showLoading();
    try {
        const { data: fetchedProducts, error: productsError } = await supabaseClient
            .from('products')
            .select(`
                id,
                name,
                description,
                price,
                is_featured,
                is_offer,
                category_id,
                images ( url )
            `)
            .eq('is_active', true);

        if (productsError) throw productsError;
        products = fetchedProducts.map(p => ({
            ...p,
            images: p.images || []
        }));

        const { data: categoriesData, error: categoriesError } = await supabaseClient
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (categoriesError) throw categoriesError;

        renderCategories(categoriesData);
        showAllProducts();

    } catch (error) {
        console.error("Error al cargar datos:", error.message);
        // Si hay error, ocultamos la carga y mostramos un mensaje general si es necesario
    } finally {
        hideLoading();
    }
};

// --- Manejo de la Interfaz ---
const showAllProducts = () => {
    const featuredProducts = products.filter(p => p.is_featured);
    const offerProducts = products.filter(p => p.is_offer);

    featuredSection.style.display = featuredProducts.length > 0 ? 'block' : 'none';
    offersSection.style.display = offerProducts.length > 0 ? 'block' : 'none';
    filteredSection.style.display = 'none';

    renderProducts(featuredProducts, featuredContainer);
    renderProducts(offerProducts, offersGrid);

    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === 'all') {
            item.classList.add('active');
        }
    });
};

const filterByCategory = (categoryId) => {
    const filteredProducts = products.filter(p => p.category_id === categoryId);

    featuredSection.style.display = 'none';
    offersSection.style.display = 'none';
    filteredSection.style.display = 'block';

    searchResultsTitle.textContent = 'Productos por Categoría';
    noProductsMessage.style.display = filteredProducts.length === 0 ? 'block' : 'none';

    renderProducts(filteredProducts, allFilteredContainer);

    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === categoryId) {
            item.classList.add('active');
        }
    });
};

const handleSearch = (query) => {
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery.length === 0) {
        showAllProducts();
        return;
    }

    const searchResults = products.filter(p =>
        p.name.toLowerCase().includes(trimmedQuery) ||
        p.description.toLowerCase().includes(trimmedQuery)
    );

    featuredSection.style.display = 'none';
    offersSection.style.display = 'none';
    filteredSection.style.display = 'block';

    searchResultsTitle.textContent = `Resultados para "${query}"`;
    noProductsMessage.style.display = searchResults.length === 0 ? 'block' : 'none';

    renderProducts(searchResults, allFilteredContainer);

    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
};


// --- Manejo de Modales ---
const openModal = (modalElement) => {
    modalElement.classList.add('active');
    modalElement.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
};

const closeModal = (modalElement) => {
    modalElement.classList.remove('active');
    modalElement.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

const openProductModal = (productId) => {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    modalProductName.textContent = currentProduct.name;
    // Mostrar descripción completa
    modalProductDescription.textContent = currentProduct.description;
    modalProductPrice.textContent = formatPrice(currentProduct.price);
    qtyInput.value = 1;
    currentImageIndex = 0;

    carouselImagesContainer.innerHTML = '';
    currentProduct.images.forEach(image => {
        const img = document.createElement('img');
        img.className = 'carousel-image';
        img.src = image.url || 'https://via.placeholder.com/400x300?text=Sin+Imagen';
        img.alt = currentProduct.name;
        carouselImagesContainer.appendChild(img);
    });

    updateCarousel();
    openModal(productModal);
};

// --- Manejo del Checkout ---
const handleCheckout = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderItems = cart.map(item => `${item.name} (${item.quantity}x)`).join(', ');
    const whatsappMessage = `Hola, quiero realizar un pedido: \nProductos: ${orderItems}\nTotal a pagar: ${formatPrice(total)}`;

    orderDetails = { total, orderItems, whatsappMessage };

    orderSuccessTotal.textContent = formatPrice(total);
    orderSuccessDescription.textContent = orderDetails.orderItems;

    whatsappBtn.href = `https://wa.me/573227671829?text=${encodeURIComponent(orderDetails.whatsappMessage)}`;

    closeModal(cartModal);
    openModal(successModal);
    clearCart(); // Limpiar carrito después de mostrar el modal de éxito
};

// --- Banner de Instalación PWA ---
const handleInstallPrompt = (e) => {
    deferredPrompt = e;
    installBanner.hidden = false;
};

const handleInstallClick = () => {
    installBanner.hidden = true;
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('El usuario aceptó la instalación A2HS');
            } else {
                console.log('El usuario rechazó la instalación A2HS');
            }
            deferredPrompt = null;
        });
    }
};

const handleBannerClose = () => {
    installBanner.hidden = true;
};

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
    fetchProducts();

    // Carrusel de Banners
    let bannerIndex = 0;
    const bannerSlides = bannerCarousel.querySelectorAll('.banner-slide');

    const updateBannerCarousel = () => {
        const offset = -bannerIndex * 100;
        bannerCarousel.style.transform = `translateX(${offset}%)`;

        bannerDotsContainer.innerHTML = '';
        bannerSlides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `dot ${index === bannerIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                bannerIndex = index;
                updateBannerCarousel();
            });
            bannerDotsContainer.appendChild(dot);
        });
    };

    const nextSlide = () => {
        bannerIndex = (bannerIndex + 1) % bannerSlides.length;
        updateBannerCarousel();
    };

    if (bannerCarousel && bannerDotsContainer && bannerSlides.length > 0) {
        updateBannerCarousel();
        setInterval(nextSlide, 5000);
    }
});

// Búsqueda
searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

// Navegación del Carrusel del Modal
prevBtn && prevBtn.addEventListener('click', () => {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateCarousel();
    }
});

nextBtn && nextBtn.addEventListener('click', () => {
    if (currentProduct && currentImageIndex < currentProduct.images.length - 1) {
        currentImageIndex++;
        updateCarousel();
    }
});

// Añadir al Carrito
modalAddToCartBtn && modalAddToCartBtn.addEventListener('click', () => {
    const quantity = parseInt(qtyInput.value);
    if (quantity > 0 && currentProduct) {
        addToCart(currentProduct, quantity);
    }
});

// Abrir Carrito
cartBtn && cartBtn.addEventListener('click', () => openModal(cartModal));

// Cerrar Carrito
closeCartBtn && closeCartBtn.addEventListener('click', () => closeModal(cartModal));

// Cerrar Modal de Producto
modalCloseBtn && modalCloseBtn.addEventListener('click', () => closeModal(productModal));

// Cerrar Modal de Éxito
closeSuccessBtn.forEach(btn => btn.addEventListener('click', () => closeModal(successModal)));
closeSuccessFinalBtn && closeSuccessFinalBtn.addEventListener('click', () => closeModal(successModal));

// Checkout
checkoutBtn && checkoutBtn.addEventListener('click', handleCheckout);

// Cerrar modales haciendo clic fuera (Product Modal)
productModal && productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
        closeModal(productModal);
    }
});

// Cerrar modales haciendo clic fuera (Cart Modal)
cartModal && cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        closeModal(cartModal);
    }
});

// Cerrar modales haciendo clic fuera (Success Modal)
successModal && successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeModal(successModal);
    }
});

// Eventos de instalación PWA
window.addEventListener('beforeinstallprompt', handleInstallPrompt);
installPromptBtn && installPromptBtn.addEventListener('click', handleInstallClick);
installCloseBtn && installCloseBtn.addEventListener('click', handleBannerClose);

// Abrir overlay de zoom al hacer click en la imagen del carousel
carouselImagesContainer && carouselImagesContainer.addEventListener('click', (e) => {
  const img = e.target.closest('.carousel-image');
  if (!img) return;
  if (!imageZoomOverlay) return;
  imageZoomImg.src = img.src || img.getAttribute('src');
  openModal(imageZoomOverlay);
});

// Cerrar overlay imagen al hacer click afuera de la imagen o en el botón X
if (imageZoomOverlay) {
  imageZoomOverlay.addEventListener('click', (e) => {
    if (e.target === imageZoomOverlay || e.target.classList.contains('zoom-close') || e.target.closest('.zoom-close')) {
      closeModal(imageZoomOverlay);
      imageZoomImg.src = '';
    }
  });

  if (zoomCloseBtn) {
    zoomCloseBtn.addEventListener('click', () => {
      closeModal(imageZoomOverlay);
      imageZoomImg.src = '';
    });
  }

  // Si el usuario hace click sobre la imagen también cerramos (toque para cerrar)
  imageZoomImg && imageZoomImg.addEventListener('click', () => {
    closeModal(imageZoomOverlay);
    imageZoomImg.src = '';
  });
}

// Lógica para Ads (simulando click en un producto al hacer click en el ad)
document.querySelectorAll('.ad-image').forEach(ad => {
    ad.addEventListener('click', () => {
        const productId = ad.dataset.productId;
        if (productId) {
            openProductModal(productId);
        }
    });
});