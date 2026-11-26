import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Restaurant } from '../../core/services/restaurant/restaurant';
import { Dish } from '../../core/services/dish/dish';
import { CartService } from '../../core/services/cart/cart';

@Component({
  selector: 'app-restaurant-details',
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.css',
})
export class RestaurantDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly restaurantService = inject(Restaurant);
  private readonly dishService = inject(Dish);
  private readonly cart = inject(CartService);
  restaurant: any = null;
  dishes: any[] = [];
  message = '';
  loading = true;
  error = '';

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.restaurantService.getById(id).subscribe({
      next: (result) => {
        this.restaurant = result;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de charger ce restaurant.';
        this.loading = false;
        this.changeDetector.markForCheck();
      }
    });
    this.dishService.getAll({ restaurant: id, limit: 100 }).subscribe({
      next: (result) => {
        this.dishes = result.dishes || [];
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de charger le menu.';
        this.changeDetector.markForCheck();
      }
    });
  }

  addToCart(dish: any): void {
    if (!dish.disponible) {
      this.message = 'Ce plat est indisponible.';
      return;
    }
    if (!this.cart.addItem(dish, this.restaurant._id)) {
      this.message = 'Le panier ne peut contenir des plats que d’un seul restaurant.';
      return;
    }
    this.message = `${dish.nom} ajouté au panier`;
    this.changeDetector.markForCheck();
  }
}
