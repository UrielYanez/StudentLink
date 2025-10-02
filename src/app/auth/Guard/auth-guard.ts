import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Auth } from '../Service/auth';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: Auth, 
    private router: Router
  ) {}
canActivate(
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> | boolean {
  const token = this.authService.getToken();
  
  // Si no existe token, redirige
  if (!token) {
    this.redirectToLogin(state.url);
    return false;
  }

  // Si existe token, permite acceso
  return true;
}

  private redirectToLogin(returnUrl: string): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: returnUrl }
    });
    this.authService.removeToken();
  }
}