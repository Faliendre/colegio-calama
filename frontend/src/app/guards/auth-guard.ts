import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  console.log('AuthGuard ejecutado');
  console.log('Token encontrado:', token ? 'SÍ' : 'NO');
  console.log('Ruta solicitada:', state.url);

  if (token) {
    console.log('Acceso permitido');
    return true;
  } else {
    console.log('Acceso denegado, redirigiendo al login');
    router.navigate(['/login']);
    return false;
  }
};
