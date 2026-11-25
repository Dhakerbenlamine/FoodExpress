import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Order } from '../../core/services/order/order';

@Component({
  selector: 'app-my-orders',
  imports: [NgFor, NgIf],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders {
  private readonly orderService = inject(Order);
  orders: any[] = [];
  loading = true;
  error = '';

  constructor() {
    this.orderService.getMyOrders().subscribe({
      next: (result) => { this.orders = result.orders || []; this.loading = false; },
      error: (error) => { this.error = error.error?.message || 'Impossible de charger vos commandes.'; this.loading = false; }
    });
  }
}
