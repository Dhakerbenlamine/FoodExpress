import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  email = '';
  password = '';
  error = '';
  notice = '';

  constructor() {
    if (this.route.snapshot.queryParamMap.get('reason') === 'account-disabled') {
      this.notice = 'Votre compte a été désactivé par un administrateur. Contactez le support.';
    }
  }

  submit(): void {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }
        const role = this.auth.getUser()?.role;
        if (role === 'admin') this.router.navigate(['/admin-dashboard/statistics']);
        else if (role === 'restaurateur') this.router.navigate(['/restaurant-dashboard']);
        else this.router.navigate(['/']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Connexion impossible.';
        this.changeDetector.markForCheck();
      }
    });
  }
}
