// =======================================================
// INTERFACES DEL PATRÓN OBSERVER
// =======================================================

/**
 * Interfaz para los Observers (Suscriptores)
 */
export interface CompetenciaObserver {
  update(data: CompetenciaData | null): void;
}

/**
 * Interfaz para el Subject (Publicador)
 */
export interface CompetenciaSubject {
  subscribe(observer: CompetenciaObserver): void;
  unsubscribe(observer: CompetenciaObserver): void;
  notifyObservers(): void;
}

/**
 * Estructura de datos para competencia
 */
export interface CompetenciaData {
  competencia: number[];
  estado: string;
  miMatch?: number;
}
