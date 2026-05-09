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
            savedItems.forEach(item => {
                this.items.set(item.id, item);
            });
        } catch (error) {
            console.warn('Falha ao carregar o carrinho do localStorage:', error);
            this.items.clear();
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

        const existing = this.items.get(product.id);
        if (existing) {
            existing.quantity += product.quantity;
            this.items.set(product.id, existing);
        } else {
            this.items.set(product.id, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
            });
        }

        this.save();
    }

    updateQuantity(id, quantity) {
        const current = this.items.get(id);
        if (!current) return;

        if (quantity <= 0) {
            this.items.delete(id);
        } else {
            current.quantity = quantity;
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
}
