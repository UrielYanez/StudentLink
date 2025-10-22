export interface MatchingRequest {
  tipo: number;
  clienteId: number;
  salario?: number;
  modalidad?: string;
  area?: string;
  titulo?: string;
  horario?: string;
}

export interface Habilidad {
  nombre: string | null;
  status: boolean | null;
}

export interface Idioma {
  nombre: string | null;
  status: boolean | null;
}

export interface AreaMatch {
  nombre: string;
  status: boolean;
}

export interface SalarioMatch {
  vacante_salario: number;
  usuario_salario: number;
  status: boolean;
}

export interface VacanteMatch {
  id: number;
  titulo: string;
  empresa: string;
  descripcion: string;
  beneficios: string;
  horas_por_semana: number;
  dias_laborales: string;
  turno: string;
  horario_flexible: boolean;
  ubicacion: string;
  salario: number;
  area: string;
  modalidad: string;
  habilidades: Habilidad[];
  idiomas: Idioma[];
  area_match: AreaMatch;
  salario_match: SalarioMatch;
  porcentaje_match: number;
  postulante?: boolean; 
}