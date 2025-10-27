import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DireccionRespuesta {
  estado: string;
  municipio: string;
  colonias: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DireccionService {
private miApiUrl = 'http://localhost:3000/api/direccion'; // Ejemplo

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la información de dirección basado en un Código Postal
   * @param cp El código postal de 5 dígitos
   */
  getInfoPorCP(cp: string): Observable<DireccionRespuesta> {
    // Llamamos al endpoint que creamos en Node.js
    return this.http.get<DireccionRespuesta>(`${this.miApiUrl}/${cp}`);
  }
}
