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
    private injector: Injector, // Solo usar para obtener UsuarioContextService dinámicamente
     private usuarioContextService: UsuarioContextService
  ) {}

  private getUsuarioContext(): UsuarioContextService {
    // Obtenemos el servicio dinámicamente para evitar circular dependency
    return this.injector.get(UsuarioContextService);
  }

login(email: string, password: string): Observable<LoginResponse> {
    this.removeToken(); // limpia datos anteriores
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { email, password }).pipe(
      tap(response => {
        if (response?.token) {
          this.setToken(response.token);
        }
        if (response?.user) {
          this.setUserData(response.user);
        }
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.usuarioContextService.setToken(token);
  }

  setUserData(userData: any): void {
    const roles = userData.roles?.map((r: any) => r.name) ?? [];
    const userToStore = {
      id: userData.id,
      name: userData.username || userData.email,
      roles
    };
     localStorage.setItem('user', JSON.stringify(userToStore));
    this.usuarioContextService.setUsuarioData(userToStore);
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