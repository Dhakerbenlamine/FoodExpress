import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { CartService } from '../../core/services/cart/cart';
import { Auth } from '../../core/services/auth/auth';
import { Order } from '../../core/services/order/order';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, NgIf],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly cart = inject(CartService);
  private readonly auth = inject(Auth);
  private readonly orderService = inject(Order);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  adresseLivraison = '';
  remarque = '';
  modePaiement = 'livraison';
  error = '';
  loading = false;

  get items() { return this.cart.getItems(); }
  get sousTotal() { return this.cart.getSousTotal(); }

  confirm(): void {
    if (!this.auth.getToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    if (this.items.length === 0) {
      this.error = 'Votre panier est vide.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.orderService.create({
      restaurant: this.items[0].restaurant,
      adresseLivraison: this.adresseLivraison,
      remarque: this.remarque,
      modePaiement: this.modePaiement,
      articles: this.items.map((item) => ({ plat: item._id, quantite: item.quantite }))
    }).subscribe({
      next: () => {
        this.cart.clear();
        this.router.navigate(['/my-orders']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de confirmer la commande.';
        this.loading = false;
        this.changeDetector.markForCheck();
      }
    });
  }
}
