import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsuarioContextService } from './usuario-context-service';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environments';

// Definir interfaces para las respuestas
interface LoginResponse {
  token: string;
  user?: any;
}
interface TokenValidationResponse {
  status: string;
  valid: boolean;
  message?: string;
  email?: string;
  userDetails?: {
    email: string;
    roles: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(
    private http: HttpClient,
    private router: Router,
    private injector: Injector // Solo usar para obtener UsuarioContextService dinámicamente
  ) {}

  private getUsuarioContext(): UsuarioContextService {
    // Obtenemos el servicio dinámicamente para evitar circular dependency
    return this.injector.get(UsuarioContextService);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    this.removeToken();
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        if (response?.token) {
          this.setToken(response.token);
          if (response.user) {
            this.setUserData(response.user);
          }
        }
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      const userData = {
        name: decodedPayload?.sub || 'Usuario',
        roles: decodedPayload?.roles || []
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // Actualizar UsuarioContextService dinámicamente
      this.getUsuarioContext().setUsuarioData(userData, token);
    } catch (err) {
      console.error('Error al procesar el token:', err);
    }
  }

  setUserData(userData: any): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = {
      name: userData.email || currentUser.name,
      id: userData.id,
      roles: currentUser.roles || [],
      empresaId: userData.empresa?.id || null
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.getUsuarioContext().setUsuarioData(updatedUser);
    if (updatedUser.empresaId) {
      this.getUsuarioContext().setEmpresaId(updatedUser.empresaId);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.getUsuarioContext().limpiarDatos();
  }

  logout(): void {
    this.removeToken();
    this.router.navigate(['/auth/login']);
  }
}