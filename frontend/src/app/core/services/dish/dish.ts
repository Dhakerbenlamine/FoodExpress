import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Dish {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/dishes';

  getAll(filters: Record<string, string | number> = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined) params = params.set(key, String(value));
    });
    return this.http.get(this.apiUrl, { params });
  }
}
