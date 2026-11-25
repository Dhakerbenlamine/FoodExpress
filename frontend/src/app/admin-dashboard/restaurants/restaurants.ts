import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Admin } from '../../core/services/admin/admin';

@Component({
  selector: 'app-restaurants',
  imports: [NgFor, NgIf],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
})
export class Restaurants {
  private readonly admin = inject(Admin);
  restaurants: any[] = [];
  constructor() { this.load(); }
  load(): void {
    this.admin.getRestaurants().subscribe({
      next: (result) => { this.restaurants = result.restaurants || []; }
    });
  }
  setValidation(restaurant: any, statutValidation: 'validee' | 'suspendue'): void {
    this.admin.setRestaurantValidation(restaurant._id, statutValidation).subscribe({ next: () => this.load() });
  }
}
