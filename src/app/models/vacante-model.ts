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
