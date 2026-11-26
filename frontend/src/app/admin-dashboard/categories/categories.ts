import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { Admin } from '../../core/services/admin/admin';
import { AdminNav } from '../../shared/admin-nav/admin-nav';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, NgFor, AdminNav],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  private readonly admin = inject(Admin);
  private readonly changeDetector = inject(ChangeDetectorRef);
  restaurants: any[] = [];
  categories: any[] = [];
  restaurantId = '';
  nom = '';
  constructor() {
    this.admin.getRestaurants().subscribe({
      next: (result) => {
        this.restaurants = result.restaurants || [];
        this.changeDetector.markForCheck();
      }
    });
    this.load();
  }
  load(): void {
    this.admin.getCategories(this.restaurantId).subscribe({
      next: (categories) => {
        this.categories = categories || [];
        this.changeDetector.markForCheck();
      }
    });
  }
  save(): void {
    if (!this.restaurantId || !this.nom.trim()) return;
    this.admin.createCategory({ restaurant: this.restaurantId, nom: this.nom }).subscribe({
      next: () => { this.nom = ''; this.load(); }
    });
  }
  remove(category: any): void {
    this.admin.deleteCategory(category._id).subscribe({ next: () => this.load() });
  }
}
