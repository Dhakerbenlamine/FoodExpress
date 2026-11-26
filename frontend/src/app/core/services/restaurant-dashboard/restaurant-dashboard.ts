import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RestaurantDashboard {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/api';

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/restaurant-stats`);
  }

  getOrders(): Observable<any> {
    return this.http.get(`${this.api}/orders/restaurant`);
  }

  updateOrderStatus(id: string, statut: string): Observable<any> {
    return this.http.put(`${this.api}/orders/${id}/status`, { statut });
  }

  getDishes(restaurantId: string): Observable<any> {
    return this.http.get(`${this.api}/dishes`, { params: { restaurant: restaurantId, limit: 100 } });
  }

  createDish(data: any): Observable<any> {
    return this.http.post(`${this.api}/dishes`, data);
  }

  updateDish(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/dishes/${id}`, data);
  }

  deleteDish(id: string): Observable<any> {
    return this.http.delete(`${this.api}/dishes/${id}`);
  }

  getRestaurants(): Observable<any> {
    return this.http.get(`${this.api}/restaurants`, { params: { limit: 100 } });
  }

  updateRestaurant(id: string, data: object): Observable<any> {
    return this.http.put(`${this.api}/restaurants/${id}`, data);
  }
}
