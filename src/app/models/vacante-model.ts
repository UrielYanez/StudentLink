export interface Vacante {
  id?: number;
  titulo: string;
  descripcion: string;
  salario: number;
  tipoContrato: string;
  solicitudesPermitidas: number;
  estado: string;
  fechaCreacion?: string;
  fechaExpiracion: string;
  beneficios?: string;
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
  postulados?: any[];
  porcentajeMatch?: number;
  habilidadesMatch?: any[];
  idiomasMatch?: any[];
  areaMatch?: any;
  salarioMatch?: any;
  empresaId?: number;
}

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
  tipoContrato: string;
  solicitudesPermitidas: number;
  estado?: string;
  fechaExpiracion: string;
  beneficios?: string;
  empresaId: number;
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
  empresaId: number;
  empresaNombre?: string;
  salario: number;
  area: string;
  modalidad: string;
  habilidades: string[];
  idiomas: string[];
  descripcion: string;
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
