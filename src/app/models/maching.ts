export interface MatchingRequest {
  tipo: number;
  clienteId: number;
  salario?: number;
  area?: string;
  modalidad?: string;
  titulo?: string;
  horario?: string;
}




// 🔥 NUEVO: Interface para postulados
export interface PostuladoMatch {
  usuario_id: number;
  username: string;
  email: string;
  salario: number;
  area: string;
  habilidades: string[];
  idiomas: string[];
  porcentaje_match: number;
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
  empresa: number;
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
  // 🔥 NUEVO: Campo para postulados (solo en tipo 2)
  postulados?: PostuladoMatch[];
}
