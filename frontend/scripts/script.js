const cart = typeof Cart !== 'undefined' ? new Cart() : null;
const productCards = document.querySelectorAll('.product-card');
const cartBadge = document.querySelector('.cart-badge');
const cartLink = document.querySelector('.cart-link');
const cartPanel = document.getElementById('cart-panel');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartClose = document.querySelector('.cart-close');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartEmptyMessage = document.querySelector('.cart-empty-message');
const checkoutButton = document.getElementById('checkout-button');
let cartCloseTimer;

function updateCartBadge() {
    if (!cart || !cartBadge) return;
    const quantity = cart.getTotalQuantity();
    cartBadge.textContent = quantity;
    cartBadge.dataset.count = quantity;
}

function openCartPanel() {
    if (!cartPanel || !cartBackdrop) return;
    clearTimeout(cartCloseTimer);
    cartPanel.classList.remove('hidden');
    cartBackdrop.classList.remove('hidden');
    cartPanel.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
        cartPanel.classList.add('open');
        cartBackdrop.classList.add('visible');
    });
}

function closeCartPanel() {
    if (!cartPanel || !cartBackdrop) return;
    cartPanel.classList.remove('open');
    cartBackdrop.classList.remove('visible');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartCloseTimer = setTimeout(() => {
        cartPanel.classList.add('hidden');
        cartBackdrop.classList.add('hidden');
    }, 250);
}

function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';

    cartItem.innerHTML = `
        <div class="cart-item-details">
            <strong>${escapeHtml(item.name)}</strong>
            <span>Preço unitário: ${formatPrice(item.price)}</span>
            <span>Subtotal: ${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="cart-item-actions">
            <div class="cart-quantity-controls">
                <button type="button" class="cart-decrease" aria-label="Diminuir quantidade">−</button>
                <span>${item.quantity}</span>
                <button type="button" class="cart-increase" aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" class="cart-remove">Remover</button>
        </div>
    `;

    const decreaseButton = cartItem.querySelector('.cart-decrease');
    const increaseButton = cartItem.querySelector('.cart-increase');
    const quantityLabel = cartItem.querySelector('.cart-quantity-controls span');
    const removeButton = cartItem.querySelector('.cart-remove');

    decreaseButton.addEventListener('click', () => {
        if (!cart) return;
        const newQuantity = item.quantity - 1;
        cart.updateQuantity(item.id, newQuantity);
        animateQuantityChange(quantityLabel);
        refreshCartUI();
    });

    increaseButton.addEventListener('click', () => {
        if (!cart) return;
        cart.updateQuantity(item.id, item.quantity + 1);
        animateQuantityChange(quantityLabel);
        refreshCartUI();
    });

    removeButton.addEventListener('click', () => {
        if (!cart) return;
        cart.removeItem(item.id);
        refreshCartUI();
    });

    return cartItem;
}

function renderCartPanel() {
    if (!cart || !cartItemsContainer || !cartTotal || !cartEmptyMessage || !checkoutButton) return;
    const items = cart.getItems();
    cartItemsContainer.innerHTML = '';

    if (items.length === 0) {
        cartEmptyMessage.classList.remove('hidden');
        checkoutButton.disabled = true;
        cartTotal.textContent = formatPrice(0);
        return;
    }

    cartEmptyMessage.classList.add('hidden');
    checkoutButton.disabled = false;
    items.forEach(item => {
        const cartItemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = formatPrice(cart.getTotalPrice());
}

function refreshCartUI() {
    updateCartBadge();
    renderCartPanel();
}

function getProductData(card) {
    const productId = card.dataset.productId || card.querySelector('.product-title').textContent.trim().toLowerCase().replace(/\s+/g, '-');
    const productTitle = card.querySelector('.product-title').textContent.trim();
    const productPriceText = card.querySelector('.product-price').textContent.trim();
    const quantityDisplay = card.querySelector('.quantity-display');
    const quantity = clampQuantity(quantityDisplay.value);
    quantityDisplay.value = quantity;

    return {
        id: productId,
        name: productTitle,
        price: parsePrice(productPriceText),
        quantity,
    };
}

function clampQuantity(value) {
    const quantity = parseInt(value, 10);
    if (Number.isNaN(quantity) || quantity < 1) return 1;
    if (quantity > 99) return 99;
    return quantity;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function animateQuantityChange(element) {
    element.classList.add('updated');
    setTimeout(() => {
        element.classList.remove('updated');
    }, 200);
}

function showAddedNotification(button, quantity) {
    const originalContent = button.innerHTML;
    button.classList.add('added');
    button.innerHTML = `<i class="fas fa-check"></i> ${quantity} item${quantity > 1 ? 's' : ''} adicionado${quantity > 1 ? 's' : ''}`;

    setTimeout(() => {
        button.classList.remove('added');
        button.innerHTML = originalContent;
    }, 1200);
}

productCards.forEach((card) => {
    const quantityDisplay = card.querySelector('.quantity-display');
    const decreaseButton = card.querySelector('.quantity-decrease');
    const increaseButton = card.querySelector('.quantity-increase');
    const addToCartButton = card.querySelector('.add-to-cart-button');

    if (!quantityDisplay) return;

    if (decreaseButton) {
        decreaseButton.addEventListener('click', () => {
            let currentValue = clampQuantity(quantityDisplay.value);
            if (currentValue > 1) {
                quantityDisplay.value = currentValue - 1;
            }
        });
    }

    if (increaseButton) {
        increaseButton.addEventListener('click', () => {
            let currentValue = clampQuantity(quantityDisplay.value);
            if (currentValue < 99) {
                quantityDisplay.value = currentValue + 1;
            }
        });
    }

    if (quantityDisplay) {
        quantityDisplay.addEventListener('change', () => {
            quantityDisplay.value = clampQuantity(quantityDisplay.value);
        });
    }

    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            if (!cart) {
                console.error('Cart não disponível');
                return;
            }
            const product = getProductData(card);
            cart.addItem(product);
            refreshCartUI();
            showAddedNotification(addToCartButton, product.quantity);

            setTimeout(() => {
                quantityDisplay.value = 1;
            }, 500);
        });
    }
});

if (cartLink) {
    cartLink.addEventListener('click', event => {
        event.preventDefault();
        if (cartPanel && cartPanel.classList.contains('open')) {
            closeCartPanel();
        } else {
            refreshCartUI();
            openCartPanel();
        }
    });
}

if (cartClose) {
    cartClose.addEventListener('click', closeCartPanel);
}

if (cartBackdrop) {
    cartBackdrop.addEventListener('click', closeCartPanel);
}

if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        if (!cart || cart.getTotalQuantity() === 0) return;
        window.location.href = 'checkout.html';
    });
}

function parsePrice(priceText) {
    const normalized = priceText
        .replace(/\s/g, '')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.');
    return parseFloat(normalized) || 0;
}

function formatPrice(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}
