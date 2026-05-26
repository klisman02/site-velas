const CART_STORAGE_KEY = 'bamiraCart';

class Cart {
    constructor() {
        this.items = new Map();
        this.load();
    }

    load() {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return;

        try {
            const savedItems = JSON.parse(raw);
            if (!Array.isArray(savedItems)) {
                throw new Error('Formato inválido do carrinho');
            }

            savedItems.forEach(item => {
                if (!this.isValidItem(item)) return;
                this.items.set(item.id, {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                });
            });
        } catch (error) {
            console.warn('Falha ao carregar o carrinho do localStorage:', error);
            this.items.clear();
            this.save();
        }
    }

    save() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(Array.from(this.items.values())));
    }

    getItems() {
        return Array.from(this.items.values());
    }

    getTotalQuantity() {
        return this.getItems().reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.getItems().reduce((total, item) => total + item.price * item.quantity, 0);
    }

    addItem(product) {
        if (!product || !product.id) return;

        const quantity = this.normalizeQuantity(product.quantity);
        if (quantity < 1) return;

        const existing = this.items.get(product.id);
        if (existing) {
            existing.quantity = this.normalizeQuantity(existing.quantity + quantity);
            this.items.set(product.id, existing);
        } else {
            this.items.set(product.id, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity,
            });
        }

        this.save();
    }

    updateQuantity(id, quantity) {
        const current = this.items.get(id);
        if (!current) return;

        const normalizedQuantity = this.normalizeQuantity(quantity);
        if (normalizedQuantity <= 0) {
            this.items.delete(id);
        } else {
            current.quantity = normalizedQuantity;
            this.items.set(id, current);
        }

        this.save();
    }

    removeItem(id) {
        if (!this.items.has(id)) return;
        this.items.delete(id);
        this.save();
    }

    clear() {
        this.items.clear();
        this.save();
    }

    normalizeQuantity(quantity) {
        const parsedQuantity = Number(quantity);
        if (!Number.isFinite(parsedQuantity)) return 0;
        return Math.max(0, Math.min(99, Math.floor(parsedQuantity)));
    }

    isValidItem(item) {
        return item
            && typeof item.id === 'string'
            && typeof item.name === 'string'
            && Number.isFinite(item.price)
            && Number.isInteger(item.quantity)
            && item.price >= 0
            && item.quantity > 0
            && item.quantity <= 99;
    }
}
