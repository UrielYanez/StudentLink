import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  /**
   * Obtiene el ID del usuario logueado desde localStorage.
   * @returns El ID (número) o null si no se encuentra.
   */
  public getAuthUserId(): number | null {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // Basado en tu JSON: {id: 3, ...}
        return user.id ? Number(user.id) : null;
      } catch (e) {
        console.error('Error al parsear usuario de localStorage', e);
        return null;
      }
    }
    return null;
  }
}
