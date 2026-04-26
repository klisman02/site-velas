// Seleciona todos os cards de produtos
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    const quantityDisplay = card.querySelector('.quantity-display');
    const decreaseButton = card.querySelector('.quantity-decrease');
    const increaseButton = card.querySelector('.quantity-increase');
    const addToCartButton = card.querySelector('.add-to-cart-button');
    const productTitle = card.querySelector('.product-title');
    const productPrice = card.querySelector('.product-price');

    // Função para atualizar a quantidade (diminuir)
    decreaseButton.addEventListener('click', () => {
        let currentValue = parseInt(quantityDisplay.value);
        if (currentValue > 1) {
            quantityDisplay.value = currentValue - 1;
        }
    });

    // Função para atualizar a quantidade (aumentar)
    increaseButton.addEventListener('click', () => {
        let currentValue = parseInt(quantityDisplay.value);
        if (currentValue < 99) {
            quantityDisplay.value = currentValue + 1;
        }
    });

    // Permitir digitação direta no campo de quantidade
    quantityDisplay.addEventListener('change', () => {
        let value = parseInt(quantityDisplay.value);
        if (isNaN(value) || value < 1) {
            quantityDisplay.value = 1;
        } else if (value > 99) {
            quantityDisplay.value = 99;
        }
    });

    // Função para adicionar ao carrinho
    addToCartButton.addEventListener('click', () => {
        const quantity = parseInt(quantityDisplay.value);
        const price = productPrice.textContent.trim();
        
        // Cria um objeto com os dados do produto
        const cartItem = {
            name: productTitle.textContent.trim(),
            quantity: quantity,
            price: price
        };

        // Simula a adição ao carrinho (aqui você poderia enviar para um servidor)
        console.log('Produto adicionado ao carrinho:', cartItem);

        // Feedback visual
        showAddedNotification(addToCartButton, quantity);

        // Reseta a quantidade após adicionar
        setTimeout(() => {
            quantityDisplay.value = 1;
        }, 500);
    });
});

// Função para exibir notificação de produto adicionado
function showAddedNotification(button, quantity) {
    const originalText = button.innerHTML;
    const originalColor = button.style.backgroundColor;

    // Muda o texto do botão
    button.innerHTML = `<i class="fas fa-check"></i> Adicionado (${quantity})`;
    button.style.backgroundColor = '#4caf50';

    // Volta ao estado original após 2 segundos
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = originalColor;
    }, 2000);
}

// Evento de busca (placeholder para funcionalidade futura)
const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-input');

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

// Logs para demonstrar funcionalidade
console.log('✓ Página carregada com sucesso!');
console.log('✓ Todos os listeners de eventos estão configurados.');
