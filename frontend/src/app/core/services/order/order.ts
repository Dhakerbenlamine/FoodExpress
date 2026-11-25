import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '../auth/auth';

@Injectable({ providedIn: 'root' })
export class Order {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly apiUrl = 'http://localhost:3000/api/orders';

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.headers() });
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-orders`, { headers: this.headers() });
  }
}
