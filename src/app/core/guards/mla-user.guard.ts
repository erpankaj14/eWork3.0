import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const mlaUserGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (Number(auth.getCurrentUser()?.usertype) === 9) return true;
  return router.createUrlTree(['/portal/hub']);
};
