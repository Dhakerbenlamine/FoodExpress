import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';

export const roleGuardGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const roles = (route.data['roles'] as string[]) || [];
  const user = auth.getUser();
  if (user && roles.includes(user.role)) return true;
  return router.createUrlTree(['/']);
};
