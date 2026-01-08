import ItemInstance from './Items.js';

class Slot {
    constructor() {
        this.item = null;
    }

    isEmpty() {
        return this.item === null;
    }

    hasItem() {
        return this.item !== null;
    }

    canStackWith(item) {
        return (
            !this.isEmpty() &&
            this.item.itemId === item.itemId &&
            this.item.isStackable()
        );
    }
}

class Inventory {
    constructor(size = 32) {
        this.slots = Array.from({ length: size }, () => new Slot());
    }

    moveItem(fromIndex, toIndex, quantity = null) {
        // Validación de índices
        if (
            fromIndex < 0 || fromIndex >= this.slots.length ||
            toIndex < 0 || toIndex >= this.slots.length
        ) {
            throw new Error("Índice fuera de rango");
        }

        const from = this.slots[fromIndex];
        const to = this.slots[toIndex];

        if (from.isEmpty()) {
            throw new Error("Slot origen vacío");
        }

        const item = from.item;
        const moveQty = quantity ?? item.quantity;

        if (moveQty <= 0 || moveQty > item.quantity) {
            throw new Error("Cantidad inválida");
        }

        // No stackeables → solo mover 1
        if (!item.isStackable() && moveQty > 1) {
            throw new Error("Item no apilable");
        }

        // Slot destino vacío
        if (to.isEmpty()) {
            if (item.isStackable() && moveQty < item.quantity) {
                to.item = new ItemInstance(item.itemId, {
                    quantity: moveQty
                });
                item.quantity -= moveQty;
            } else {
                to.item = item;
                from.item = null;
            }
            return;
        }

        // Apilar
        if (to.canStackWith(item)) {
            const freeSpace = to.item.maxStack() - to.item.quantity;
            if (freeSpace <= 0) return;

            const amount = Math.min(freeSpace, moveQty);
            to.item.quantity += amount;
            item.quantity -= amount;

            if (item.quantity === 0) {
                from.item = null;
            }
            return;
        }

        throw new Error("Slot destino incompatible");
    }
}

export default new Inventory();