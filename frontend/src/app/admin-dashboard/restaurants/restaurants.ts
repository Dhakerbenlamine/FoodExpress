import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Admin } from '../../core/services/admin/admin';
import { AdminNav } from '../../shared/admin-nav/admin-nav';
import { ImageUrlPipe } from '../../core/pipes/image-url-pipe';

@Component({
  selector: 'app-restaurants',
  imports: [NgFor, NgIf, AdminNav, ImageUrlPipe],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
})
export class Restaurants {
  private readonly admin = inject(Admin);
  private readonly changeDetector = inject(ChangeDetectorRef);
  restaurants: any[] = [];
  uploadingId = '';
  message = '';
  error = '';
  constructor() { this.load(); }
  load(): void {
    this.admin.getRestaurants().subscribe({
      next: (result) => {
        this.restaurants = result.restaurants || [];
        this.changeDetector.markForCheck();
      }
    });
  }
  setValidation(restaurant: any, statutValidation: 'validee' | 'suspendue'): void {
    this.admin.setRestaurantValidation(restaurant._id, statutValidation).subscribe({
      next: () => this.load(),
      error: (error) => {
        this.error = error.error?.message || 'Impossible de modifier la validation.';
        this.changeDetector.markForCheck();
      }
    });
  }

  uploadPhoto(event: Event, restaurant: any): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    this.uploadingId = restaurant._id;
    this.message = '';
    this.error = '';
    this.admin.updateRestaurant(restaurant._id, formData).subscribe({
      next: (result) => {
        restaurant.image = result.image;
        this.uploadingId = '';
        this.message = `Photo de ${restaurant.nom} mise à jour.`;
        input.value = '';
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.uploadingId = '';
        this.error = error.error?.message || 'Impossible d’importer cette photo.';
        input.value = '';
        this.changeDetector.markForCheck();
      }
    });
  }
}
