import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';
import { MatchingRequest, VacanteMatch } from '../models/maching';


@Injectable({
  providedIn: 'root'
})
export class Maching {
 private apiUrl = `${environment.apiUrl}/api/ms_maching/maching`;

  constructor(private http: HttpClient) { }

  /**
   * Realiza una búsqueda de vacantes con matching
   * @param request Datos de búsqueda (campos opcionales excepto tipo y clienteId)
   * @returns Observable con array de vacantes que coinciden
   */
  public postMatching(request: MatchingRequest): Observable<VacanteMatch[]> {
    // Crear objeto solo con campos definidos (no undefined/null)
    const body = this.cleanRequestBody(request);
    return this.http.post<VacanteMatch[]>(this.apiUrl, body);
  }

  /**
   * Método sobrecargado para mantener compatibilidad con código anterior
   */
  public postMatchingLegacy(
    tipo: number,
    clienteId: number,
    salario?: number,
    modalidad?: string,
    area?: string,
    titulo?: string,
    horario?: string
  ): Observable<VacanteMatch[]> {
    const request: MatchingRequest = {
      tipo,
      clienteId,
      salario,
      modalidad,
      area,
      titulo,
      horario
    };
    return this.postMatching(request);
  }

  /**
   * Limpia el objeto de request eliminando propiedades undefined o null
   * @param request Objeto con los datos de búsqueda
   * @returns Objeto limpio solo con propiedades definidas
   */
  private cleanRequestBody(request: MatchingRequest): Partial<MatchingRequest> {
    const cleanBody: Partial<MatchingRequest> = {
      tipo: request.tipo,
      clienteId: request.clienteId
    };

    // Solo agregar campos opcionales si tienen valor
    if (request.salario !== undefined && request.salario !== null) {
      cleanBody.salario = request.salario;
    }
    if (request.modalidad) {
      cleanBody.modalidad = request.modalidad;
    }
    if (request.area) {
      cleanBody.area = request.area;
    }
    if (request.titulo) {
      cleanBody.titulo = request.titulo;
    }
    if (request.horario) {
      cleanBody.horario = request.horario;
    }

    return cleanBody;
  }
}
