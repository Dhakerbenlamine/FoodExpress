import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RestaurantDashboard } from '../../core/services/restaurant-dashboard/restaurant-dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly service = inject(RestaurantDashboard);
  stats: any = null;
  error = '';

  constructor() {
    this.service.getStats().subscribe({
      next: (stats) => { this.stats = stats; },
      error: (error) => { this.error = error.error?.message || 'Impossible de charger les statistiques.'; }
    });
  }
}
