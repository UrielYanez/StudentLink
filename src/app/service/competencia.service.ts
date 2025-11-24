// =======================================================
// SUBJECT (PUBLISHER) - Implementación manual
// =======================================================

import { Injectable } from '@angular/core';
import { CompetenciaData, CompetenciaObserver, CompetenciaSubject } from '../interfaces/observer.interface';

@Injectable({
  providedIn: 'root'
})
export class CompetenciaObserverService implements CompetenciaSubject {

  // Lista de observadores suscritos
  private observers: CompetenciaObserver[] = [];

  // Estado actual del subject
  private currentData: CompetenciaData | null = null;

  /**
   * Suscribe un nuevo observer
   */
  subscribe(observer: CompetenciaObserver): void {
    const exists = this.observers.includes(observer);
    if (!exists) {
      this.observers.push(observer);
      console.log('Observer suscrito. Total:', this.observers.length);

      // Notificar inmediatamente con el estado actual (patrón BehaviorSubject)
      if (this.currentData) {
        observer.update(this.currentData);
      }
    }
  }

  /**
   * Desuscribe un observer
   */
  unsubscribe(observer: CompetenciaObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      console.log('Observer desuscrito. Total:', this.observers.length);
    }
  }

  /**
   * Notifica a TODOS los observers
   */
  notifyObservers(): void {
    console.log(`Notificando a ${this.observers.length} observers`);

    for (const observer of this.observers) {
      try {
        observer.update(this.currentData);
      } catch (error) {
        console.error('Error notificando observer:', error);
      }
    }
  }

  /**
   * Método público para cambiar el estado y notificar
   */
  notificarCambio(data: CompetenciaData): void {
    this.currentData = data;
    this.notifyObservers();
  }

  /**
   * Limpiar datos y notificar
   */
  limpiar(): void {
    this.currentData = null;
    this.notifyObservers();
  }

  /**
   * Obtener valor actual
   */
  obtenerValorActual(): CompetenciaData | null {
    return this.currentData;
  }

  /**
   * Obtener cantidad de observers (para debugging)
   */
  getCantidadObservers(): number {
    return this.observers.length;
  }
}
