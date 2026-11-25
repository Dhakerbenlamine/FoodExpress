import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RestaurantDashboard } from '../../core/services/restaurant-dashboard/restaurant-dashboard';

@Component({
  selector: 'app-manage-orders',
  imports: [NgFor, NgIf],
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css',
})
export class ManageOrders {
  private readonly service = inject(RestaurantDashboard);
  orders: any[] = [];
  error = '';

  constructor() { this.load(); }

  load(): void {
    this.service.getOrders().subscribe({
      next: (result) => { this.orders = result.orders || []; },
      error: (error) => { this.error = error.error?.message || 'Impossible de charger les commandes.'; }
    });
  }

  changeStatus(order: any, statut: string): void {
    this.service.updateOrderStatus(order._id, statut).subscribe({
      next: () => this.load(),
      error: (error) => { this.error = error.error?.message || 'Transition refusée.'; }
    });
  }
}
