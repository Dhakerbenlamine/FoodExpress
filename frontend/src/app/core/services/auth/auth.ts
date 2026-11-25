import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface FoodExpressUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'client' | 'restaurateur' | 'admin';
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((response: any) => this.saveSession(response))
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => this.saveSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem('foodexpress_token');
    localStorage.removeItem('foodexpress_user');
  }

  getUser(): FoodExpressUser | null {
    const value = localStorage.getItem('foodexpress_user');
    return value ? JSON.parse(value) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('foodexpress_token');
  }

  private saveSession(response: any): void {
    localStorage.setItem('foodexpress_token', response.token);
    localStorage.setItem('foodexpress_user', JSON.stringify(response.user));
  }
}
