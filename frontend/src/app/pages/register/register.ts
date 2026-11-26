import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  password = '';
  confirmation = '';
  error = '';

  submit(): void {
    this.error = '';
    this.auth.register({
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      password: this.password,
      confirmation: this.confirmation
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => {
        this.error = error.error?.message || 'Inscription impossible.';
        this.changeDetector.markForCheck();
      }
    });
  }
}
