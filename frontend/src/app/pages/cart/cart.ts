import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { CartService, CartItem } from '../../core/services/cart/cart';
import { ImageUrlPipe } from '../../core/pipes/image-url-pipe';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, NgFor, NgIf, ImageUrlPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private readonly cart = inject(CartService);
  items: CartItem[] = [];

  constructor() { this.load(); }
  load(): void { this.items = this.cart.getItems(); }
  increment(item: CartItem): void { this.cart.updateQuantity(item._id, item.quantite + 1); this.load(); }
  decrement(item: CartItem): void { this.cart.updateQuantity(item._id, item.quantite - 1); this.load(); }
  remove(item: CartItem): void { this.cart.removeItem(item._id); this.load(); }
  get sousTotal(): number { return this.cart.getSousTotal(); }
}
