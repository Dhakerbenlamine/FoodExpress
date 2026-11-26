import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Admin {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/api';

  getUsers(search = ''): Observable<any> {
    return this.http.get(`${this.api}/users`, { params: search ? { search } : {} });
  }

  toggleUser(id: string): Observable<any> {
    return this.http.put(`${this.api}/users/${id}/toggle-active`, {});
  }

  getRestaurants(page = 1): Observable<any> {
    return this.http.get(`${this.api}/admin/restaurants`, { params: { page, limit: 100 } });
  }

  setRestaurantValidation(id: string, statutValidation: 'validee' | 'suspendue'): Observable<any> {
    return this.http.put(`${this.api}/restaurants/${id}/validation`, { statutValidation });
  }

  updateRestaurant(id: string, data: object): Observable<any> {
    return this.http.put(`${this.api}/restaurants/${id}`, data);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/admin/stats`);
  }

  getCategories(restaurant = ''): Observable<any> {
    const params: Record<string, string> = restaurant ? { restaurant } : {};
    return this.http.get(`${this.api}/categories`, { params });
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.api}/categories`, data);
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.api}/categories/${id}`);
  }
}
