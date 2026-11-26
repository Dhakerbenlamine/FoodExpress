import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth/auth';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const token = auth.getToken();
  const authenticatedRequest = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authenticatedRequest).pipe(
    catchError((error) => {
      const compteDesactive =
        error.status === 403 && error.error?.message === 'Compte désactivé';

      if (error.status === 401 || compteDesactive) {
        auth.logout();
        router.navigate(
          ['/login'],
          compteDesactive ? { queryParams: { reason: 'account-disabled' } } : undefined
        );
      }
      return throwError(() => error);
    })
  );
};
