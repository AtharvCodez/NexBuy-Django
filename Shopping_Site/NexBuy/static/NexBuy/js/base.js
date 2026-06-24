// ========== SHARED BASE JAVASCRIPT ==========

document.addEventListener("DOMContentLoaded", () => {
    // ========== SNAPPY PRELOADER ==========
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.4,
            delay: 0.2,
            onComplete: () => {
                preloader.style.display = 'none';
            }
        });
    }

    // ========== SMOOTH SCROLL FOR ANCHORS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ========== ACTIVE BOTTOM NAV ITEM ==========
    const currentPath = window.location.pathname;
    const bottomLinks = document.querySelectorAll('.bottom-nav-link');
    bottomLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && currentPath.includes(linkPath)) {
            link.classList.add('active');
        }
    });

    // ========== INLINE SEARCH EXPANSION ==========
    const searchTrigger = document.getElementById('nav-search-trigger');
    const searchInput = document.getElementById('navbar-search-input');

    if (searchTrigger && searchInput) {
        searchTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (searchInput.style.width === '0px' || searchInput.style.width === '') {
                searchInput.style.width = '180px';
                searchInput.style.padding = '0 12px';
                searchInput.style.opacity = '1';
                searchInput.style.pointerEvents = 'auto';
                setTimeout(() => searchInput.focus(), 150);
            } else {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/product.html?search=${encodeURIComponent(query)}`;
                } else {
                    searchInput.style.width = '0px';
                    searchInput.style.padding = '0';
                    searchInput.style.opacity = '0';
                    searchInput.style.pointerEvents = 'none';
                }
            }
        });

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#search-wrapper')) {
                searchInput.style.width = '0px';
                searchInput.style.padding = '0';
                searchInput.style.opacity = '0';
                searchInput.style.pointerEvents = 'none';
            }
        });

        // Search on Enter key press
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/product.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // ========== CART DRAWER & STATE ==========
    const cartTrigger = document.getElementById('nav-cart-trigger');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-drawer-items');
    const cartSubtotal = document.getElementById('cart-drawer-subtotal');
    const cartBadge = document.querySelector('#nav-cart-trigger span');

    // Cart initial items with currency support and localStorage persistence
    let cart = JSON.parse(localStorage.getItem('nexbuy_cart'));
    if (!cart) {
        cart = [
            { name: "Sony WH-1000XM5", price: 24990, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80", currency: "₹", quantity: 1 },
            { name: "Nike Air Jordan 1", price: 6495, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", currency: "₹", quantity: 1 }
        ];
        localStorage.setItem('nexbuy_cart', JSON.stringify(cart));
    } else {
        // Guarantee all loaded items have a quantity set
        cart.forEach(item => {
            if (!item.quantity) item.quantity = 1;
        });
    }

    // Create toast container dynamically (only one for the page)
    let toast = document.getElementById("toast-message");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-message";
        document.body.appendChild(toast);
    }

    // Add CSS directly from JS
    const style = document.createElement("style");
    style.textContent = `
        #toast-message {
            position: fixed;
            bottom: -80px;
            left: 50%;
            transform: translateX(-50%);
            background: #0f0f15;
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            border: 1.5px solid var(--accent-primary);
            box-shadow: 0 0 15px rgba(249, 115, 22, 0.5);
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            opacity: 0;
            z-index: 99999;
        }
        #toast-message.show {
            bottom: 30px;
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Global function to show the toast
    window.showToast = function(message) {
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500); // visible for 2.5 seconds
    };

    function updateCartUI() {
        // Save to localStorage
        localStorage.setItem('nexbuy_cart', JSON.stringify(cart));
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            let subtotalRupees = 0;
            let subtotalDollars = 0;
            
            cart.forEach((item, index) => {
                const itemCurrency = item.currency || '₹';
                const itemQty = item.quantity || 1;
                const totalItemPrice = item.price * itemQty;
                if (itemCurrency === '$') {
                    subtotalDollars += totalItemPrice;
                } else {
                    subtotalRupees += totalItemPrice;
                }
                
                cartItemsContainer.innerHTML += `
                    <div style="display: flex; gap: 16px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center;">
                        <img src="${item.image}" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;">
                        <div style="flex: 1;">
                            <h4 style="font-size: 0.95rem; font-weight: 600; color: white; margin-bottom: 4px;">${item.name}</h4>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="color: var(--accent-primary); font-weight: 700;">${itemCurrency}${item.price.toLocaleString(itemCurrency === '₹' ? 'en-IN' : 'en-US')}</div>
                                <div style="color: var(--text-secondary); font-size: 0.85rem; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 20px;">Qty: ${itemQty}</div>
                            </div>
                        </div>
                        <i class="ph ph-trash" style="color: var(--text-secondary); cursor: pointer; font-size: 1.2rem; transition: 0.2s;" data-index="${index}"></i>
                    </div>
                `;
            });
            
            if (cartSubtotal) {
                let subtotalText = '';
                if (subtotalRupees > 0) {
                    subtotalText += `₹${subtotalRupees.toLocaleString('en-IN')}`;
                }
                if (subtotalDollars > 0) {
                    if (subtotalText) subtotalText += ' + ';
                    subtotalText += `$${subtotalDollars.toLocaleString('en-US')}`;
                }
                if (!subtotalText) subtotalText = '₹0';
                cartSubtotal.innerText = subtotalText;
            }
            
            if (cartBadge) {
                const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
                cartBadge.innerText = totalQty;
                cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
            }
        }
    }

    if (cartTrigger && cartDrawer) {
        cartTrigger.addEventListener('click', () => {
            cartDrawer.style.right = '0';
        });
    }

    if (closeCart && cartDrawer) {
        closeCart.addEventListener('click', () => {
            cartDrawer.style.right = '-400px';
        });
    }

    // Delete item from cart
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('ph-trash')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                const removedItem = cart[index];
                cart.splice(index, 1);
                updateCartUI();
                if (window.showToast) {
                    window.showToast(`🛒 Removed ${removedItem.name} from cart`);
                }
            }
        });
    }

    // Add item function to global window so other scripts can access it
    window.addToCart = function(name, price, image, currency = '₹') {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            updateCartUI();
            if (cartDrawer) {
                cartDrawer.style.right = '0';
            }
            if (window.showToast) {
                window.showToast(`🛒 Added another ${name} (Qty: ${existingItem.quantity}) to cart!`);
            }
        } else {
            cart.push({ name, price, image, currency, quantity: 1 });
            updateCartUI();
            if (cartDrawer) {
                cartDrawer.style.right = '0';
            }
            if (window.showToast) {
                window.showToast(`🛒 Added ${name} to cart!`);
            }
        }
    };

    // Global Event Delegation for Dynamic Cart / Notify Buttons
    document.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const productName = addToCartBtn.getAttribute('data-product');
            const price = parseFloat(addToCartBtn.getAttribute('data-price') || "0");
            const currency = addToCartBtn.getAttribute('data-currency') || "₹";
            
            // Resolve image source
            let image = addToCartBtn.getAttribute('data-image') || "";
            if (!image) {
                const card = addToCartBtn.closest('.stack-card');
                if (card) {
                    image = card.querySelector('.card-image img')?.getAttribute('src') || "";
                } else {
                    const prodCard = addToCartBtn.closest('.product-card-large');
                    if (prodCard) {
                        image = prodCard.querySelector('.product-image')?.getAttribute('src') || "";
                    } else {
                        const trendCard = addToCartBtn.closest('.trending-product');
                        if (trendCard) {
                            image = trendCard.querySelector('.trending-image')?.getAttribute('src') || "";
                        }
                    }
                }
            }
            
            window.addToCart(productName, price, image, currency);
        }
        
        const notifyBtn = e.target.closest('.notify-btn');
        if (notifyBtn) {
            e.preventDefault();
            e.stopPropagation();
            const productName = notifyBtn.closest('.stack-card')?.querySelector('h3')?.innerText || "Product";
            if (window.showToast) {
                window.showToast(`🔔 Notification set for ${productName}!`);
            }
        }
    });

    // Redirect checking after login
    if (window.isUserAuthenticated && sessionStorage.getItem('nexbuy_redirect_checkout') === 'true') {
        sessionStorage.removeItem('nexbuy_redirect_checkout');
        // Capture subtotal and route to subscription
        let subtotalRupees = 0;
        let subtotalDollars = 0;
        cart.forEach(item => {
            const itemCurrency = item.currency || '₹';
            const itemQty = item.quantity || 1;
            const totalItemPrice = item.price * itemQty;
            if (itemCurrency === '$') {
                subtotalDollars += totalItemPrice;
            } else {
                subtotalRupees += totalItemPrice;
            }
        });
        localStorage.setItem('nexbuy_last_order', JSON.stringify({
            subtotalRupees: subtotalRupees,
            subtotalDollars: subtotalDollars,
            itemCount: cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        }));
        window.location.href = '/subscription.html';
    }

    // Checkout Button Redirect & State Capture
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!window.isUserAuthenticated) {
                // Save redirect flag and navigate to login page
                sessionStorage.setItem('nexbuy_redirect_checkout', 'true');
                if (window.showToast) {
                    window.showToast("🔒 Please sign in to proceed to checkout.");
                }
                setTimeout(() => {
                    window.location.href = '/sign_in.html?next=/subscription.html';
                }, 1000);
                return;
            }

            let subtotalRupees = 0;
            let subtotalDollars = 0;
            cart.forEach(item => {
                const itemCurrency = item.currency || '₹';
                const itemQty = item.quantity || 1;
                const totalItemPrice = item.price * itemQty;
                if (itemCurrency === '$') {
                    subtotalDollars += totalItemPrice;
                } else {
                    subtotalRupees += totalItemPrice;
                }
            });
            localStorage.setItem('nexbuy_last_order', JSON.stringify({
                subtotalRupees: subtotalRupees,
                subtotalDollars: subtotalDollars,
                itemCount: cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
            }));
            window.location.href = '/subscription.html';
        });
    }

    // Initial load UI
    updateCartUI();
});
