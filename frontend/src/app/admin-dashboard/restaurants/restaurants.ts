import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Admin } from '../../core/services/admin/admin';
import { AdminNav } from '../../shared/admin-nav/admin-nav';

@Component({
  selector: 'app-restaurants',
  imports: [NgFor, NgIf, AdminNav],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
})
export class Restaurants {
  private readonly admin = inject(Admin);
  private readonly changeDetector = inject(ChangeDetectorRef);
  restaurants: any[] = [];
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
    this.admin.setRestaurantValidation(restaurant._id, statutValidation).subscribe({ next: () => this.load() });
  }
}
