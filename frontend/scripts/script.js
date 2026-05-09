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
const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-input');

function updateCartBadge() {
    if (!cart || !cartBadge) return;
    const quantity = cart.getTotalQuantity();
    cartBadge.textContent = quantity;
    cartBadge.dataset.count = quantity;
}

function openCartPanel() {
    if (!cartPanel || !cartBackdrop) return;
    cartPanel.classList.add('open');
    cartPanel.classList.remove('hidden');
    cartBackdrop.classList.add('visible');
    cartPanel.setAttribute('aria-hidden', 'false');
}

function closeCartPanel() {
    if (!cartPanel || !cartBackdrop) return;
    cartPanel.classList.remove('open');
    cartBackdrop.classList.remove('visible');
    cartPanel.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
        cartPanel.classList.add('hidden');
    }, 250);
}

function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';

    cartItem.innerHTML = `
        <div class="cart-item-details">
            <strong>${item.name}</strong>
            <span>Preço unitário: ${formatPrice(item.price)}</span>
            <span>Subtotal: ${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="cart-item-actions">
            <div class="cart-quantity-controls">
                <button type="button" class="cart-decrease" aria-label="Diminuir quantidade">−</button>
                <span>${item.quantity}</span>
                <button type="button" class="cart-increase" aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" class="cart-remove" data-item-id="${item.id}">Remover</button>
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
    const quantity = parseInt(quantityDisplay.value, 10) || 1;

    return {
        id: productId,
        name: productTitle,
        price: parsePrice(productPriceText),
        quantity,
    };
}

function animateQuantityChange(element) {
    element.classList.add('updated');
    setTimeout(() => {
        element.classList.remove('updated');
    }, 200);
}

productCards.forEach((card, index) => {
    console.log(`Processando card ${index}:`, card);
    const quantityDisplay = card.querySelector('.quantity-display');
    const decreaseButton = card.querySelector('.quantity-decrease');
    const increaseButton = card.querySelector('.quantity-increase');
    const addToCartButton = card.querySelector('.add-to-cart-button');

    console.log('Elementos encontrados:', { quantityDisplay, decreaseButton, increaseButton, addToCartButton });

    if (decreaseButton) {
        decreaseButton.addEventListener('click', () => {
            let currentValue = parseInt(quantityDisplay.value, 10);
            if (currentValue > 1) {
                quantityDisplay.value = currentValue - 1;
            }
        });
    }

    if (increaseButton) {
        increaseButton.addEventListener('click', () => {
            let currentValue = parseInt(quantityDisplay.value, 10);
            if (currentValue < 99) {
                quantityDisplay.value = currentValue + 1;
            }
        });
    }

    if (quantityDisplay) {
        quantityDisplay.addEventListener('change', () => {
            let value = parseInt(quantityDisplay.value, 10);
            if (isNaN(value) || value < 1) {
                quantityDisplay.value = 1;
            } else if (value > 99) {
                quantityDisplay.value = 99;
            }
        });
    }

    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            console.log('Botão adicionar clicado');
            if (!cart) {
                console.error('Cart não disponível');
                return;
            }
            const product = getProductData(card);
            console.log('Produto:', product);
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

// Evento de busca (placeholder para funcionalidade futura)

if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            console.log('Buscando por:', searchTerm);
            // Aqui você adicionaria a lógica de busca
            alert(`Buscando por: "${searchTerm}"`);
        }
    });

    // Permite buscar ao pressionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
}

if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        if (!cart || cart.getTotalQuantity() === 0) return;
        alert('Seu pedido foi processado com sucesso! Total: ' + formatPrice(cart.getTotalPrice()));
        cart.clear();
        refreshCartUI();
        closeCartPanel();
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

console.log('Script carregado. Cart disponível:', typeof Cart !== 'undefined');
console.log('Cart instance:', cart);
console.log('Product cards encontrados:', productCards.length);
