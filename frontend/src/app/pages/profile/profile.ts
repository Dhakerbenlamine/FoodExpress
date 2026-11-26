import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, NgIf],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  nom = '';
  prenom = '';
  telephone = '';
  message = '';
  error = '';

  constructor() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    this.http.get<any>('http://localhost:3000/api/users/profile', { headers }).subscribe({
      next: (result) => {
        this.nom = result.nom;
        this.prenom = result.prenom;
        this.telephone = result.telephone;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = error.error?.message || 'Profil indisponible.';
        this.changeDetector.markForCheck();
      }
    });
  }

  update(): void {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    this.http.put<any>('http://localhost:3000/api/users/profile',
      { nom: this.nom, prenom: this.prenom, telephone: this.telephone },
      { headers }
    ).subscribe({
      next: (result) => {
        this.message = result.message;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = error.error?.message || 'Modification impossible.';
        this.changeDetector.markForCheck();
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
