// DOM elements
const productsContainer = document.getElementById('productsContainer');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const overlay = document.getElementById('overlay');

// Get current page category
function getCurrentCategory() {
    const path = window.location.pathname;
    if (path.includes('food')) return 'food';
    if (path.includes('home')) return 'home';
    if (path.includes('electronics')) return 'electronics';
    if (path.includes('shopping')) return 'shopping';
    if (path.includes('furniture')) return 'furniture';
    if (path.includes('fashion')) return 'fashion';
    if (path.includes('books')) return 'books';
    if (path.includes('sports')) return 'sports';
    if (path.includes('beauty')) return 'beauty';
    if (path.includes('toys')) return 'toys';
    if (path.includes('home-garden')) return 'home-garden';
    return 'food'; // default
}

// Get products for current page
function getProductsForPage() {
    const category = getCurrentCategory();
    switch(category) {
        case 'home':
            return homeProducts;
        case 'food':
            return foodProducts;
        case 'electronics':
            return electronicsProducts;
        case 'shopping':
            return shoppingProducts;
        case 'furniture':
            return furnitureProducts;
        case 'books':
            return booksProducts;
        case 'sports':
            return sportsProducts;
        case 'beauty':
            return beautyProducts;
        case 'toys':
            return toysProducts;
        case 'home-garden':
            return homeGardenProducts;
        case 'fashion':
            return fashionProducts;
        default:
            return foodProducts;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    cartManager.updateCartCount();
    loadProducts();
    
    // Event listeners
    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (overlay) overlay.addEventListener('click', closeCartSidebar);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
});

// Function to load products dynamically
function loadProducts() {
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    const products = getProductsForPage();
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Function to create product card
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-id', product.id);
    
    const cart = cartManager.getCart();
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    productCard.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">
                Ksh${product.price.toLocaleString()}
                ${product.originalPrice ? `<span class="original-price">Ksh${product.originalPrice.toLocaleString()}</span>` : ''}
            </div>
            ${product.discount ? `<div class="discount">${product.discount}</div>` : ''}
            <p class="product-description">${product.description}</p>
            <div class="quantity-controls">
                <div class="quantity-buttons">
                    <button class="quantity-btn decrease" onclick="decreaseQuantity(${product.id})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity" id="quantity-${product.id}">${quantity}</span>
                    <button class="quantity-btn increase" onclick="increaseQuantity(${product.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="delete-btn" onclick="removeFromCart(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    
    return productCard;
}

// Cart functions
function addToCart(productId) {
    const products = getProductsForPage();
    const product = products.find(p => p.id === productId);
    cartManager.addToCart(product);
    updateProductQuantity(productId);
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`);
}

function increaseQuantity(productId) {
    const cart = cartManager.getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        cartManager.saveCart();
        cartManager.updateCartCount();
        updateProductQuantity(productId);
        updateCartDisplay();
    } else {
        addToCart(productId);
    }
}

function decreaseQuantity(productId) {
    const cart = cartManager.getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity -= 1;
        
        if (existingItem.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        cartManager.saveCart();
        cartManager.updateCartCount();
        updateProductQuantity(productId);
        updateCartDisplay();
    }
}

function removeFromCart(productId) {
    const products = getProductsForPage();
    const product = products.find(p => p.id === productId);
    cartManager.removeFromCart(productId);
    updateProductQuantity(productId);
    updateCartDisplay();
    showNotification(`${product.name} removed from cart!`);
}

function updateProductQuantity(productId) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    const cart = cartManager.getCart();
    const cartItem = cart.find(item => item.id === productId);
    
    if (quantityElement) {
        quantityElement.textContent = cartItem ? cartItem.quantity : '0';
    }
}

function updateCartDisplay() {
    if (!cartItems) return;
    
    const cart = cartManager.getCart();
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = 'Ksh0';
    } else {
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <i class="${item.image}"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Ksh${item.price.toLocaleString()} x ${item.quantity}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" onclick="decreaseQuantity(${item.id})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" onclick="increaseQuantity(${item.id})">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="delete-btn" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            cartItems.appendChild(cartItemElement);
        });
        
        if (cartTotal) cartTotal.textContent = `Ksh${total.toLocaleString()}`;
    }
}

// Cart sidebar functions
function openCart() {
    if (!cartSidebar || !overlay) return;
    updateCartDisplay();
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
    if (!cartSidebar || !overlay) return;
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function checkout() {
    const cart = cartManager.getCart();
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`Order placed successfully! Total: Ksh${totalAmount.toLocaleString()}`, 'success');
    
    cartManager.clearCart();
    closeCartSidebar();
    
    // Reset all product quantities on current page
    const products = getProductsForPage();
    products.forEach(product => {
        updateProductQuantity(product.id);
    });
}

// Notification function (same as before)
function showNotification(message, type = 'success') {
    // ... (keep your existing notification code)
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    // Add keyframes for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}