// Menu functionality
let menu = document.querySelector('.menu');
let menuBtn = document.querySelector('.menu-btn');
let closeBtn = document.querySelector('.close-btn');

menuBtn.addEventListener('click', () => {
    menu.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    menu.classList.remove('active');
});

// Category functionality
const categoryButtons = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const category = button.dataset.category;
        filterProducts(category);
    });
});

function filterProducts(category) {
    productCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Cart state with localStorage persistence
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartTotal = 0;

// Helper function to format price
const formatPrice = (price) => `₱${parseFloat(price).toFixed(2)}`;

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add to cart functionality
function addToCart(productCard) {
    const title = productCard.querySelector('.product-title').textContent;
    const price = parseFloat(productCard.querySelector('.product-price').textContent.replace('₱', ''));
    const imageSrc = productCard.querySelector('.product-image img').src;
    const description = productCard.querySelector('.product-description').textContent;

    // Check if item already exists in cart
    const existingItem = cart.find(item => item.title === title);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            title,
            price,
            imageSrc,
            description,
            quantity: 1
        });
    }
    
    saveCart();
    updateCart();
    showNotification('Item added to cart!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update cart display
function updateCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Clear current cart items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        updateCartTotal();
        return;
    }
    
    // Add items to cart
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.imageSrc}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-description">${item.description}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.title}', -1)">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" 
                    onchange="updateQuantityInput('${item.title}', this.value)" min="1">
                <button class="quantity-btn" onclick="updateQuantity('${item.title}', 1)">+</button>
            </div>
            <div class="cart-item-remove" onclick="removeFromCart('${item.title}')">
                <i class="fas fa-trash"></i>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartTotal();
}

// Update cart total
function updateCartTotal() {
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    document.querySelector('.cart-total-amount').textContent = formatPrice(cartTotal);
    
    // Update order summary if checkout form is visible
    const orderSummary = document.querySelector('.order-summary');
    if (orderSummary) {
        orderSummary.innerHTML = `
            <h3>Order Summary</h3>
            ${cart.map(item => `
                <div class="order-summary-item">
                    <span>${item.title} (${item.quantity}x)</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('')}
            <div class="order-summary-item" style="font-weight: bold; margin-top: 10px; border-top: 1px solid #ddd; padding-top: 10px;">
                <span>Total</span>
                <span>${formatPrice(cartTotal)}</span>
            </div>
        `;
    }
}

// Update quantity
function updateQuantity(title, change) {
    const item = cart.find(item => item.title === title);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        saveCart();
        updateCart();
    }
}

// Update quantity through input
function updateQuantityInput(title, value) {
    const quantity = parseInt(value);
    if (quantity > 0) {
        const item = cart.find(item => item.title === title);
        if (item) {
            item.quantity = quantity;
            saveCart();
            updateCart();
        }
    }
}

// Remove item from cart
function removeFromCart(title) {
    cart = cart.filter(item => item.title !== title);
    saveCart();
    updateCart();
    showNotification('Item removed from cart');
}

// Toggle cart visibility
function toggleCart() {
    const cartModal = document.querySelector('.cart-modal');
    cartModal.classList.toggle('active');
}

// Show checkout form
function showCheckoutForm() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    document.querySelector('.modal-overlay').classList.add('active');
    document.querySelector('.checkout-form').classList.add('active');
    updateCartTotal();
}

// Process checkout
function processCheckout(event) {
    event.preventDefault();
    
    // Show success message
    document.querySelector('.success-message').style.display = 'block';
    document.querySelector('#checkoutForm').style.display = 'none';
    
    // Clear cart after successful checkout
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCart();
        document.querySelector('.modal-overlay').classList.remove('active');
        document.querySelector('.checkout-form').classList.remove('active');
        document.querySelector('.success-message').style.display = 'none';
        document.querySelector('#checkoutForm').style.display = 'block';
        document.querySelector('.cart-modal').classList.remove('active');
    }, 3000);
}

// Handle direct purchase
function handlePurchase(productCard) {
    addToCart(productCard);
    showCheckoutForm();
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
});