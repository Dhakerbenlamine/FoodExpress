import { Injectable } from '@angular/core';

export interface CartItem {
  _id: string;
  nom: string;
  prix: number;
  image: string;
  disponible: boolean;
  restaurant: string;
  quantite: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'foodexpress_cart';

  getItems(): CartItem[] {
    const value = localStorage.getItem(this.storageKey);
    return value ? JSON.parse(value) : [];
  }

  saveItems(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  addItem(dish: any, restaurantId: string): boolean {
    if (!dish.disponible) return false;
    const items = this.getItems();
    if (items.length > 0 && items[0].restaurant !== restaurantId) return false;
    const existing = items.find((item) => item._id === dish._id);
    if (existing) existing.quantite++;
    else {
      items.push({
        _id: dish._id,
        nom: dish.nom,
        prix: dish.prix,
        image: dish.image,
        disponible: dish.disponible,
        restaurant: restaurantId,
        quantite: 1
      });
    }
    this.saveItems(items);
    return true;
  }

  updateQuantity(dishId: string, quantity: number): void {
    const items = this.getItems();
    const item = items.find((entry) => entry._id === dishId);
    if (item) item.quantite = Math.max(1, quantity);
    this.saveItems(items);
  }

  removeItem(dishId: string): void {
    this.saveItems(this.getItems().filter((item) => item._id !== dishId));
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  getSousTotal(): number {
    return this.getItems().reduce((total, item) => total + item.prix * item.quantite, 0);
  }

  getCount(): number {
    return this.getItems().reduce((total, item) => total + item.quantite, 0);
  }
}
