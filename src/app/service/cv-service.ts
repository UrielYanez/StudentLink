import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CVCompleto } from '../interfaces/cv.interface';

@Injectable({
  providedIn: 'root'
})
export class CvService {

  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el CV completo de un usuario por el ID de autenticación (ej. 3)
   */
  obtenerCV(idAuth: number): Observable<CVCompleto> {
    return this.http.get<CVCompleto>(`${this.apiUrl}/${idAuth}/cv`);
  }

  /**
   * @param idAuth El ID de autenticación (ej. 3)
   * @param cvData El objeto JSON con los 5 arreglos
   */
  actualizarCV(idAuth: number, cvData: any): Observable<any> {
    // Llama a: PUT /api/usuarios/:id/cv
    return this.http.put(`${this.apiUrl}/${idAuth}/cv`, cvData);
  }

  generarPdfVisualizacion(idAuth: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idAuth}/cv/pdf`, {
      responseType: 'blob' // CRÍTICO: Esperamos una respuesta binaria (Blob)
    });
  }
}
