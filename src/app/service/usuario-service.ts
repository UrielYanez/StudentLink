import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el perfil de usuario usando el ID de autenticación.
   * Este es el que usamos al cargar la página.
   */
  getUsuarioPorAuthId(idAuth: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/${idAuth}`);
  }

  /**
   * Crea un nuevo perfil de usuario.
   */
  crearUsuario(perfil: any): Observable<any> {
    return this.http.post(this.apiUrl, perfil);
  }

  /**
   * Actualiza un perfil de usuario existente (usando el ID del perfil).
   */
  actualizarUsuario(idPerfil: number, perfil: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idPerfil}`, perfil);
  }
}
