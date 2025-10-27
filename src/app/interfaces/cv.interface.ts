//
// Versión corregida para que coincida con el JSON
// de la función get_cv_perfil (todo en minúsculas)
//

export interface Experiencia {
  empresa: string;
  cargo: string;
  descripcion: string;
  id?: number; // El ID que vimos en el log
}

export interface Educacion {
  universidad: string;
  carrera: string;
  fecha_inicio: string;
  fecha_fin: string;
  id?: number;
}

export interface Curso {
  nombre_curso: string;
  descripcion: string;
  curso: string;
}

export interface Habilidad {
  id_habilidad: number;
  nombre: string;
}

export interface Idioma {
  id_idioma: number;
  idioma: string; // Tu log decía 'idioma', no 'nombre'
}

// La respuesta completa de la API
export interface CVCompleto {
  experienciaLaboral: Experiencia[];
  educacion: Educacion[];
  cursos: Curso[];
  habilidades: Habilidad[];
  idiomas: Idioma[];
  // Los datos extra que vimos en el log
  id_usuario: number;
  nombre: string;
  email: string;
}
