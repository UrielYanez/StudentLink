import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interfaz para los datos de competencia
 */
export interface CompetenciaData {
  competencia: number[];
  estado: string;
  miMatch: number;
}

/**
 * Servicio que implementa el patrón Observer usando RxJS
 * Este servicio actúa como el SUBJECT (Observable)
 */
@Injectable({
  providedIn: 'root'
})
export class CompetenciaObserverService {

  // BehaviorSubject: Emite el último valor a nuevos suscriptores
  private competenciaSubject = new BehaviorSubject<CompetenciaData | null>(null);

  /**
   * Observable público para que los componentes se suscriban
   * Los componentes que se suscriban actuarán como OBSERVERS
   */
  public competencia$: Observable<CompetenciaData | null> = this.competenciaSubject.asObservable();

  constructor() {
    console.log('🔔 CompetenciaObserverService inicializado (SUBJECT creado)');
  }

  /**
   * Método para actualizar los datos (NOTIFICAR a todos los observers)
   * @param data Datos de competencia actualizados
   */
  notificarCambio(data: CompetenciaData): void {
    console.log('📢 NOTIFY: Notificando cambio a todos los observers', data);
    this.competenciaSubject.next(data);
  }

  /**
   * Método para limpiar los datos
   */
  limpiar(): void {
    console.log('🧹 NOTIFY: Limpiando datos de competencia');
    this.competenciaSubject.next(null);
  }

  /**
   * Obtiene el valor actual sin suscribirse
   */
  obtenerValorActual(): CompetenciaData | null {
    return this.competenciaSubject.value;
  }
}
