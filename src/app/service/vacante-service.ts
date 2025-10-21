import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse, Area, Habilidad, Idioma, Modalidad, Vacante, VacanteRequest } from '../models/vacante-model';
import { environment } from '../environments/environments';
import { MatchingRequest, VacanteMatch } from '../models/maching';

@Injectable({
  providedIn: 'root'
})
export class VacanteService {
  private baseUrl = `${environment.baseUrl}/api/reclutador`;
  private matchingApiUrl = `${environment.apiUrl}/api/ms_maching/maching`;

  constructor(private http: HttpClient) { }

  // Vacantes
  obtenerVacantes(): Observable<ApiResponse<Vacante[]>> {
    return this.http.get<ApiResponse<Vacante[]>>(`${this.baseUrl}/vacantes`);
  }

  obtenerVacantePorId(id: number): Observable<ApiResponse<Vacante>> {
  console.log('📥 VacanteService - Obteniendo vacante por ID:', id);
  return this.http.get<ApiResponse<Vacante>>(`${this.baseUrl}/vacantes/${id}/completa`).pipe(
    tap(response => {
      console.log('🔍 VacanteService - Respuesta completa:', response);
      if (response.success) {
        console.log('📊 VacanteService - Datos de vacante:', {
          id: response.data.id,
          titulo: response.data.titulo,
          area: response.data.area,
          modalidad: response.data.modalidad,
          habilidades: response.data.habilidades,
          idiomas: response.data.idiomas
        });
      }
    })
  );
}

obtenerVacanteParaEdicion(id: number): Observable<ApiResponse<Vacante>> {
  console.log('📥 VacanteService - Obteniendo vacante para edición:', id);
  return this.http.get<ApiResponse<Vacante>>(`${this.baseUrl}/vacantes/${id}/edicion`);
}

  obtenerVacantesPorEmpresa(empresa: string): Observable<ApiResponse<Vacante[]>> {
    return this.http.get<ApiResponse<Vacante[]>>(`${this.baseUrl}/vacantes/empresa/${empresa}`);
  }

  crearVacante(vacante: VacanteRequest): Observable<ApiResponse<Vacante>> {
    return this.http.post<ApiResponse<Vacante>>(`${this.baseUrl}/vacantes`, vacante);
  }

  actualizarVacante(id: number, vacante: VacanteRequest): Observable<ApiResponse<Vacante>> {
    return this.http.put<ApiResponse<Vacante>>(`${this.baseUrl}/vacantes/${id}`, vacante);
  }

  cambiarEstadoVacante(id: number, estado: string): Observable<ApiResponse<Vacante>> {
    return this.http.patch<ApiResponse<Vacante>>(`${this.baseUrl}/vacantes/${id}/estado`, { estado });
  }

  eliminarVacante(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/vacantes/${id}`);
  }

  // Catálogos
  obtenerAreas(): Observable<ApiResponse<Area[]>> {
    return this.http.get<ApiResponse<Area[]>>(`${this.baseUrl}/catalogos/areas`);
  }

  obtenerHabilidades(): Observable<ApiResponse<Habilidad[]>> {
    return this.http.get<ApiResponse<Habilidad[]>>(`${this.baseUrl}/catalogos/habilidades`);
  }

  obtenerHabilidadesPorArea(areaId: number): Observable<ApiResponse<Habilidad[]>> {
    return this.http.get<ApiResponse<Habilidad[]>>(`${this.baseUrl}/catalogos/habilidades/area/${areaId}`);
  }

  obtenerIdiomas(): Observable<ApiResponse<Idioma[]>> {
    return this.http.get<ApiResponse<Idioma[]>>(`${this.baseUrl}/catalogos/idiomas`);
  }

  obtenerModalidades(): Observable<ApiResponse<Modalidad[]>> {
    return this.http.get<ApiResponse<Modalidad[]>>(`${this.baseUrl}/catalogos/modalidades`);
  }

  // Crear elementos de catálogo
  crearArea(area: Area): Observable<ApiResponse<Area>> {
    return this.http.post<ApiResponse<Area>>(`${this.baseUrl}/catalogos/areas`, area);
  }

  crearHabilidad(habilidad: Habilidad): Observable<ApiResponse<Habilidad>> {
    return this.http.post<ApiResponse<Habilidad>>(`${this.baseUrl}/catalogos/habilidades`, habilidad);
  }

  crearIdioma(idioma: Idioma): Observable<ApiResponse<Idioma>> {
    return this.http.post<ApiResponse<Idioma>>(`${this.baseUrl}/catalogos/idiomas`, idioma);
  }

  crearModalidad(modalidad: Modalidad): Observable<ApiResponse<Modalidad>> {
    return this.http.post<ApiResponse<Modalidad>>(`${this.baseUrl}/catalogos/modalidades`, modalidad);
  }


  // 🔥 NUEVO: Servicio de Matching para obtener postulados
  // obtenerPostuladosYMatching(clienteId: number): Observable<VacanteMatch[]> {
  //   console.log('🎯 VacanteService - Obteniendo postulados y matching para cliente:', clienteId);

  //   const request: MatchingRequest = {
  //     tipo: 2, // Tipo 2 para obtener vacantes con postulados
  //     clienteId: clienteId
  //   };

  //   console.log('📤 VacanteService - Enviando request de matching:', request);

  //   return this.http.post<VacanteMatch[]>(this.matchingApiUrl, request).pipe(
  //     tap(response => {
  //       console.log('✅ VacanteService - Respuesta de matching recibida:', {
  //         totalVacantes: response.length,
  //         primeraVacante: response[0] ? {
  //           id: response[0].id,
  //           titulo: response[0].titulo,
  //           postuladosCount: response[0].postulados ? response[0].postulados.length : 0
  //         } : 'No hay datos'
  //       });
  //     })
  //   );
  // }

  // // 🔥 NUEVO: Servicio de Matching con filtros
  // obtenerMatchingConFiltros(request: MatchingRequest): Observable<VacanteMatch[]> {
  //   console.log('🎯 VacanteService - Obteniendo matching con filtros:', request);

  //   return this.http.post<VacanteMatch[]>(this.matchingApiUrl, request).pipe(
  //     tap(response => {
  //       console.log('✅ VacanteService - Matching con filtros recibido:', response.length);
  //     })
  //   );
  // }

  // 🔥 NUEVO: Servicio de Matching para obtener postulados
obtenerPostuladosYMatching(clienteId: number): Observable<VacanteMatch[]> {
  console.log('🎯 VacanteService - Obteniendo postulados y matching para cliente:', clienteId);

  const request: MatchingRequest = {
    tipo: 2, // Tipo 2 para obtener vacantes con postulados
    clienteId: clienteId
  };

  console.log('📤 VacanteService - Enviando request de matching:', request);

  return this.http.post<VacanteMatch[]>(this.matchingApiUrl, request).pipe(
    tap(response => {
      console.log('✅ VacanteService - Respuesta de matching recibida:', {
        totalVacantes: response.length,
        primeraVacante: response[0] ? {
          id: response[0].id,
          titulo: response[0].titulo,
          // Usar el operador de encadenamiento opcional para evitar errores
          postuladosCount: response[0].postulados ? response[0].postulados.length : 0
        } : 'No hay datos'
      });
    })
  );
}
}
