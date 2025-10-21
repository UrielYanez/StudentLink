import { VacanteMatch } from "./maching";

export interface Vacante {
  id?: number;
  titulo: string;
  descripcion: string;
  salario: number;
  ubicacion: string;
  tipoContrato: string;
  solicitudesPermitidas: number;
  estado: string;
  fechaCreacion?: string;
  fechaExpiracion: string;
  beneficios?: string;
  empresa: string;
  horaInicio?: string;
  horaFin?: string;
  diasLaborales?: string;
  horasPorSemana?: number;
  turno?: string;
  horarioFlexible: boolean;
  area?: Area;
  modalidad?: Modalidad;
  habilidades?: Habilidad[];
  idiomas?: Idioma[];
  // Agrega esta propiedad para el matching
  // matching?: VacanteMatch[];
  // 🔥 NUEVO: Campos para matching y postulados
  postulados?: any[];
  porcentajeMatch?: number;
  habilidadesMatch?: any[];
  idiomasMatch?: any[];
  areaMatch?: any;
  salarioMatch?: any;
}

// 🔥 NUEVO: Interfaces para postulados y matching
export interface Postulado {
  usuario_id: number;
  username: string;
  email: string;
  salario: number;
  area: string;
  habilidades: string[];
  idiomas: string[];
  porcentaje_match: number;
}

export interface VacanteRequest {
  titulo: string;
  descripcion: string;
  salario: number;
  ubicacion: string;
  tipoContrato: string;
  solicitudesPermitidas: number;
  estado?: string;
  fechaExpiracion: string;
  beneficios?: string;
  empresa: string;
  horaInicio?: string;
  horaFin?: string;
  diasLaborales?: string;
  horasPorSemana?: number;
  turno?: string;
  horarioFlexible: boolean;
  areaId: number;
  modalidadId: number;
  habilidadesIds: number[];
  idiomasIds: number[];
}

export interface VacanteConPostulados {
  vacante_id: number;
  titulo: string;
  empresa: string;
  salario: number;
  area: string;
  modalidad: string;
  habilidades: string[];
  idiomas: string[];
  descripcion: string;
  ubicacion: string;
  tipoContrato: string;
  solicitudesPermitidas: number;
  estado: string;
  diasLaborales: string;
  horasSemanales: number;
  turno: string;
  horarioFlexible: boolean;
  postulados: Postulado[];
}

export interface Area {
  id: number;
  nombre: string;
}

export interface Habilidad {
  id: number;
  nombre: string;
  area: Area;
}

export interface Idioma {
  id: number;
  idioma: string;
}

export interface Modalidad {
  id: number;
  nombre: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
