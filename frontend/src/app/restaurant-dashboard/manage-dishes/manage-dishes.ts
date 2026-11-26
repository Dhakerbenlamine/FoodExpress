import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RestaurantDashboard } from '../../core/services/restaurant-dashboard/restaurant-dashboard';
import { Auth } from '../../core/services/auth/auth';
import { Admin } from '../../core/services/admin/admin';

@Component({
  selector: 'app-manage-dishes',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './manage-dishes.html',
  styleUrl: './manage-dishes.css',
})
export class ManageDishes {
  private readonly service = inject(RestaurantDashboard);
  private readonly admin = inject(Admin);
  private readonly auth = inject(Auth);
  private readonly changeDetector = inject(ChangeDetectorRef);
  dishes: any[] = [];
  categories: any[] = [];
  restaurantId = '';
  editingId = '';
  message = '';
  form: any = { nom: '', prix: 0, categorie: '', disponible: true };

  constructor() {
    const userId = this.auth.getUser()?.id;
    this.service.getRestaurants().subscribe({
      next: (result) => {
        const restaurants = result.restaurants || [];
        const owned = restaurants.find((restaurant: any) => {
          const ownerId = typeof restaurant.owner === 'object' ? restaurant.owner._id : restaurant.owner;
          return ownerId === userId;
        });
        this.restaurantId = owned?._id || restaurants[0]?._id || '';
        this.changeDetector.markForCheck();
        if (this.restaurantId) this.load();
      }
    });
  }

  load(): void {
    this.service.getDishes(this.restaurantId).subscribe({
      next: (result) => {
        this.dishes = result.dishes || [];
        this.changeDetector.markForCheck();
      }
    });
    this.admin.getCategories(this.restaurantId).subscribe({
      next: (categories) => {
        this.categories = categories || [];
        this.changeDetector.markForCheck();
      }
    });
  }

  save(): void {
    if (!this.restaurantId || !this.form.nom || !this.form.categorie) {
      this.message = 'Sélectionnez une catégorie et renseignez le nom.';
      return;
    }
    const data = { ...this.form, restaurant: this.restaurantId };
    const request = this.editingId
      ? this.service.updateDish(this.editingId, data)
      : this.service.createDish(data);
    request.subscribe({
      next: () => {
        this.editingId = '';
        this.form = { nom: '', prix: 0, categorie: '', disponible: true };
        this.changeDetector.markForCheck();
        this.load();
      },
      error: (error) => {
        this.message = error.error?.message || 'Impossible de sauvegarder.';
        this.changeDetector.markForCheck();
      }
    });
  }

  edit(dish: any): void {
    this.editingId = dish._id;
    this.form = {
      nom: dish.nom,
      prix: dish.prix,
      categorie: dish.categorie?._id || dish.categorie,
      disponible: dish.disponible
    };
  }

  remove(dish: any): void {
    this.service.deleteDish(dish._id).subscribe({
      next: () => this.load(),
      error: (error) => {
        this.message = error.error?.message || 'Suppression impossible.';
        this.changeDetector.markForCheck();
      }
    });
  }
}
