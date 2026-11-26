import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RestaurantDashboard } from '../../core/services/restaurant-dashboard/restaurant-dashboard';
import { Admin } from '../../core/services/admin/admin';
import { ImageUrlPipe } from '../../core/pipes/image-url-pipe';

@Component({
  selector: 'app-manage-dishes',
  imports: [FormsModule, NgFor, NgIf, RouterLink, ImageUrlPipe],
  templateUrl: './manage-dishes.html',
  styleUrl: './manage-dishes.css',
})
export class ManageDishes {
  private readonly service = inject(RestaurantDashboard);
  private readonly admin = inject(Admin);
  private readonly changeDetector = inject(ChangeDetectorRef);
  restaurants: any[] = [];
  dishes: any[] = [];
  categories: any[] = [];
  restaurant: any = null;
  restaurantId = '';
  editingId = '';
  message = '';
  imageFile: File | null = null;
  imagePreview = '';
  restaurantPhotoMessage = '';
  form: any = { nom: '', prix: 0, categorie: '', disponible: true, description: '' };

  constructor() {
    this.service.getMyRestaurants().subscribe({
      next: (result) => {
        this.restaurants = result.restaurants || [];
        this.selectRestaurant(this.restaurants[0]?._id || '');
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message || 'Impossible de charger vos restaurants.';
        this.changeDetector.markForCheck();
      },
    });
  }

  selectRestaurant(restaurantId: string): void {
    this.restaurant = this.restaurants.find((item) => item._id === restaurantId) || null;
    this.restaurantId = this.restaurant?._id || '';
    this.dishes = [];
    this.categories = [];
    this.cancelEdit();
    if (this.restaurantId) this.load();
  }

  load(): void {
    this.service.getDishes(this.restaurantId).subscribe({
      next: (result) => {
        this.dishes = result.dishes || [];
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message || 'Impossible de charger les plats.';
        this.changeDetector.markForCheck();
      },
    });
    this.admin.getCategories(this.restaurantId).subscribe({
      next: (categories) => {
        this.categories = categories || [];
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message || 'Impossible de charger les catégories.';
        this.changeDetector.markForCheck();
      },
    });
  }

  save(): void {
    if (!this.restaurantId || !this.form.nom || !this.form.categorie) {
      this.message = 'Sélectionnez une catégorie et renseignez le nom.';
      return;
    }
    const data: any = { ...this.form, restaurant: this.restaurantId };
    if (this.imageFile) {
      const payload = new FormData();
      Object.entries(data).forEach(([key, value]) => payload.append(key, String(value)));
      payload.append('image', this.imageFile);
      this.sendDish(payload);
      return;
    }

    this.sendDish(data);
  }

  private sendDish(data: object): void {
    const request = this.editingId
      ? this.service.updateDish(this.editingId, data)
      : this.service.createDish(data);
    request.subscribe({
      next: () => {
        this.editingId = '';
        this.form = { nom: '', prix: 0, categorie: '', disponible: true, description: '' };
        this.imageFile = null;
        this.clearImagePreview();
        this.message = 'Le plat a été enregistré.';
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
      description: dish.description || '',
      prix: dish.prix,
      categorie: dish.categorie?._id || dish.categorie,
      disponible: dish.disponible
    };
    this.imageFile = null;
    this.clearImagePreview();
    this.imagePreview = dish.image || '';
  }

  selectDishImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.clearImagePreview();
    this.imageFile = file;
    this.imagePreview = URL.createObjectURL(file);
    this.message = '';
  }

  uploadRestaurantImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.restaurantId) return;

    const payload = new FormData();
    payload.append('image', file);
    this.restaurantPhotoMessage = '';
    this.service.updateRestaurant(this.restaurantId, payload).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        this.restaurantPhotoMessage = 'Photo du restaurant mise à jour.';
        input.value = '';
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.restaurantPhotoMessage = error.error?.message || 'Impossible de modifier la photo.';
        input.value = '';
        this.changeDetector.markForCheck();
      }
    });
  }

  cancelEdit(): void {
    this.editingId = '';
    this.form = { nom: '', prix: 0, categorie: '', disponible: true, description: '' };
    this.imageFile = null;
    this.clearImagePreview();
    this.message = '';
  }

  private clearImagePreview(): void {
    if (this.imagePreview.startsWith('blob:')) URL.revokeObjectURL(this.imagePreview);
    this.imagePreview = '';
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
