import { Component, OnInit } from '@angular/core';
import { Habilidad, Idioma, Vacante } from '../../models/vacante-model';
import { VacanteService } from '../../service/vacante-service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-vacante-list-component',
  standalone: false,
  templateUrl: './vacante-list-component.html',
  styleUrl: './vacante-list-component.scss'
})
export class VacanteListComponent implements OnInit {
  vacantes: Vacante[] = [];
  loading = false;
  error = '';
  showModal = false;
  vacanteEditando: any = null;
  isEditMode = false;

  // Filtros
  mostrarFiltros = false;
  filtros = {
    titulo: '',
    empresa: '',
    estado: '',
    area: ''
  };
  areas: any[] = [];

  constructor(
    private vacanteService: VacanteService,
    private router: Router
  ) {
    console.log('✅ VacanteListComponent - Constructor inicializado');
  }

  ngOnInit(): void {
    console.log('🔄 VacanteListComponent - ngOnInit iniciado');
    this.cargarVacantes();
    this.cargarAreas();
  }

  // Método para mostrar la primera vacante (más reciente o relevante)
mostrarPrimeraVacante(): void {
  if (this.vacantes.length > 0) {
    // Ordenar por fecha de creación (más reciente primero) o por relevancia
    const vacantesOrdenadas = [...this.vacantes].sort((a, b) => {
      // Aquí puedes cambiar el criterio de ordenación
      return new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime();
    });

    this.vacanteEditando = vacantesOrdenadas[0];
    this.isEditMode = true;
    console.log('📋 VacanteListComponent - Mostrando primera vacante:', this.vacanteEditando.titulo);
  }
}

  // Modifica el método cargarVacantes para que siempre muestre la primera vacante
cargarVacantes(): void {
  console.log('📥 VacanteListComponent - Cargando vacantes...');
  this.loading = true;
  this.vacanteService.obtenerVacantes().subscribe({
    next: (response) => {
      console.log('✅ VacanteListComponent - Respuesta recibida:', response);
      if (response.success) {
        this.vacantes = response.data;
        console.log(`📊 VacanteListComponent - ${this.vacantes.length} vacantes cargadas`);

        // Mostrar la primera vacante al cargar
        if (this.vacantes.length > 0) {
          this.mostrarPrimeraVacante();
        }
      } else {
        this.error = response.message || 'Error al cargar vacantes';
        console.error('❌ VacanteListComponent - Error en respuesta:', this.error);
      }
      this.loading = false;
    },
    error: (error) => {
      this.error = 'Error de conexión: ' + error.message;
      this.loading = false;
      console.error('❌ VacanteListComponent - Error HTTP:', error);
    }
  });
}

  cargarAreas(): void {
    console.log('🔄 VacanteListComponent - Cargando áreas...');
    this.vacanteService.obtenerAreas().subscribe({
      next: (response) => {
        if (response.success) {
          this.areas = response.data;
          console.log('✅ VacanteListComponent - Áreas cargadas:', this.areas.length);
        }
      },
      error: (error) => {
        console.error('❌ VacanteListComponent - Error cargando áreas:', error);
      }
    });
  }

  abrirModalNuevaVacante(): void {
    console.log('➕ VacanteListComponent - Abriendo modal para nueva vacante');
    this.isEditMode = false;
    this.vacanteEditando = null;
    this.showModal = true;
  }

  abrirModalEditarVacante(vacante: Vacante): void {
  console.log('✏️ VacanteListComponent - Abriendo modal para editar vacante:', vacante.id);
  this.isEditMode = true;

  // Cargar la vacante completa con relaciones
  this.cargarVacanteCompleta(vacante.id!);
}
  cargarVacanteCompleta(id: number): void {
  console.log('📥 VacanteListComponent - Cargando vacante completa:', id);
  this.loading = true;

  this.vacanteService.obtenerVacantePorId(id).subscribe({
    next: (response) => {
      console.log('✅ VacanteListComponent - Vacante cargada:', response);

      if (response.success) {
        const vacanteData = response.data;
        console.log('🔍 VacanteListComponent - Relaciones en respuesta:', {
          area: vacanteData.area,
          modalidad: vacanteData.modalidad,
          habilidades: vacanteData.habilidades,
          idiomas: vacanteData.idiomas
        });

        // Si las relaciones vienen vacías, intentar cargarlas manualmente
        if (!vacanteData.area || !vacanteData.modalidad || !vacanteData.habilidades || !vacanteData.idiomas) {
          console.log('⚠️ VacanteListComponent - Relaciones vacías, cargando manualmente...');
          this.cargarRelacionesManualmente(vacanteData);
        } else {
          this.vacanteEditando = vacanteData;
          this.showModal = true;
          this.loading = false;
        }
      } else {
        this.error = response.message || 'Error al cargar vacante';
        this.loading = false;
      }
    },
    error: (error) => {
      this.error = 'Error de conexión: ' + error.message;
      this.loading = false;
      console.error('❌ VacanteListComponent - Error:', error);
    }
  });
}

cargarRelacionesManualmente(vacanteData: Vacante): void {
  console.log('🔄 VacanteListComponent - Cargando relaciones manualmente');

  // Cargar todas las relaciones en paralelo
  forkJoin({
    areas: this.vacanteService.obtenerAreas(),
    modalidades: this.vacanteService.obtenerModalidades(),
    habilidades: this.vacanteService.obtenerHabilidades(),
    idiomas: this.vacanteService.obtenerIdiomas()
  }).subscribe({
    next: (responses) => {
      console.log('✅ VacanteListComponent - Relaciones cargadas manualmente');

      // Buscar el área por ID (necesitarías tener el areaId en vacanteData)
      const areaEncontrada = responses.areas.data.find(area => area.id === this.obtenerAreaIdDeVacante(vacanteData));
      const modalidadEncontrada = responses.modalidades.data.find(mod => mod.id === this.obtenerModalidadIdDeVacante(vacanteData));

      // Construir la vacante con relaciones
      this.vacanteEditando = {
        ...vacanteData,
        area: areaEncontrada,
        modalidad: modalidadEncontrada,
        habilidades: this.obtenerHabilidadesDeVacante(vacanteData, responses.habilidades.data),
        idiomas: this.obtenerIdiomasDeVacante(vacanteData, responses.idiomas.data)
      };

      console.log('📊 VacanteListComponent - Vacante con relaciones manuales:', this.vacanteEditando);
      this.showModal = true;
      this.loading = false;
    },
    error: (error) => {
      console.error('❌ VacanteListComponent - Error cargando relaciones:', error);
      // Mostrar modal aunque falle la carga de relaciones
      this.vacanteEditando = vacanteData;
      this.showModal = true;
      this.loading = false;
    }
  });
}
// Métodos auxiliares para obtener IDs (necesitas adaptarlos según tu estructura de datos)
obtenerAreaIdDeVacante(vacante: Vacante): number {
  // Si la vacante tiene areaId directamente
  if ((vacante as any).areaId) {
    return (vacante as any).areaId;
  }
  // Si tiene área pero sin ID
  if (vacante.area && vacante.area.id) {
    return vacante.area.id;
  }
  return 0;
}
obtenerModalidadIdDeVacante(vacante: Vacante): number {
  // Si la vacante tiene modalidadId directamente
  if ((vacante as any).modalidadId) {
    return (vacante as any).modalidadId;
  }
  // Si tiene modalidad pero sin ID
  if (vacante.modalidad && vacante.modalidad.id) {
    return vacante.modalidad.id;
  }
  return 0;
}

obtenerHabilidadesDeVacante(vacante: Vacante, todasHabilidades: Habilidad[]): Habilidad[] {
  // Si la vacante tiene habilidadesIds
  if ((vacante as any).habilidadesIds) {
    return todasHabilidades.filter(h => (vacante as any).habilidadesIds.includes(h.id));
  }
  // Si ya tiene habilidades
  if (vacante.habilidades && vacante.habilidades.length > 0) {
    return vacante.habilidades;
  }
  return [];
}

obtenerIdiomasDeVacante(vacante: Vacante, todosIdiomas: Idioma[]): Idioma[] {
  // Si la vacante tiene idiomasIds
  if ((vacante as any).idiomasIds) {
    return todosIdiomas.filter(i => (vacante as any).idiomasIds.includes(i.id));
  }
  // Si ya tiene idiomas
  if (vacante.idiomas && vacante.idiomas.length > 0) {
    return vacante.idiomas;
  }
  return [];
}

  cerrarModal(): void {
    console.log('❌ VacanteListComponent - Cerrando modal');
    this.showModal = false;
    this.vacanteEditando = null;
    this.isEditMode = false;
  }

  onVacanteGuardada(): void {
    console.log('💾 VacanteListComponent - Vacante guardada, recargando lista...');
    this.cerrarModal();
    this.cargarVacantes();
  }

  cambiarEstado(vacante: Vacante, nuevoEstado: string): void {
    console.log(`🔄 VacanteListComponent - Cambiando estado de vacante ${vacante.id} a ${nuevoEstado}`);
    this.vacanteService.cambiarEstadoVacante(vacante.id!, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          vacante.estado = nuevoEstado;
          console.log('✅ VacanteListComponent - Estado cambiado exitosamente');
        } else {
          this.error = response.message || 'Error al cambiar estado';
          console.error('❌ VacanteListComponent - Error cambiando estado:', this.error);
        }
      },
      error: (error) => {
        this.error = 'Error de conexión: ' + error.message;
        console.error('❌ VacanteListComponent - Error HTTP cambiando estado:', error);
      }
    });
  }

  eliminarVacante(id: number): void {
    console.log(`🗑️ VacanteListComponent - Solicitando eliminar vacante: ${id}`);
    if (confirm('¿Está seguro de que desea eliminar esta vacante?')) {
      this.vacanteService.eliminarVacante(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.vacantes = this.vacantes.filter(v => v.id !== id);
            console.log('✅ VacanteListComponent - Vacante eliminada exitosamente');
          } else {
            this.error = response.message || 'Error al eliminar vacante';
            console.error('❌ VacanteListComponent - Error eliminando vacante:', this.error);
          }
        },
        error: (error) => {
          this.error = 'Error de conexión: ' + error.message;
          console.error('❌ VacanteListComponent - Error HTTP eliminando vacante:', error);
        }
      });
    }
  }

  aplicarFiltros(): void {
    console.log('🔍 VacanteListComponent - Aplicando filtros:', this.filtros);
    // En una implementación real, aquí harías una llamada al backend con los filtros
    // Por ahora solo mostramos en consola
  }

  // Método para obtener la vacante más reciente
getVacanteMasReciente(): Vacante | null {
  if (this.vacantes.length === 0) {
    return null;
  }

  // Ordenar por fecha de creación (más reciente primero)
  // Si no tienes fechaCreación, puedes ordenar por ID o usar el primer elemento
  const vacantesOrdenadas = [...this.vacantes].sort((a, b) => {
    // Si tienes fechaCreación en tu modelo
    if (a.fechaCreacion && b.fechaCreacion) {
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    }
    // Si no, ordenar por ID (asumiendo que IDs más altos son más recientes)
    return (b.id || 0) - (a.id || 0);
  });

  return vacantesOrdenadas[0];
}

// cargarVacantes(): void {
//   console.log('📥 VacanteListComponent - Cargando vacantes...');
//   this.loading = true;
//   this.vacanteService.obtenerVacantes().subscribe({
//     next: (response) => {
//       console.log('✅ VacanteListComponent - Respuesta recibida:', response);
//       if (response.success) {
//         this.vacantes = response.data;
//         console.log(`📊 VacanteListComponent - ${this.vacantes.length} vacantes cargadas`);

//         // Verificar y cargar relaciones faltantes
//         this.cargarRelacionesParaVacantes();

//         // Mostrar la primera vacante al cargar
//         if (this.vacantes.length > 0) {
//           this.mostrarPrimeraVacante();
//         }
//       } else {
//         this.error = response.message || 'Error al cargar vacantes';
//         console.error('❌ VacanteListComponent - Error en respuesta:', this.error);
//       }
//       this.loading = false;
//     },
//     error: (error) => {
//       this.error = 'Error de conexión: ' + error.message;
//       this.loading = false;
//       console.error('❌ VacanteListComponent - Error HTTP:', error);
//     }
//   });
// }

// Método para cargar relaciones faltantes
cargarRelacionesParaVacantes(): void {
  console.log('🔄 VacanteListComponent - Verificando relaciones faltantes...');

  // Verificar si alguna vacante tiene relaciones faltantes
  const vacantesConRelacionesFaltantes = this.vacantes.filter(vacante =>
    !vacante.area || !vacante.modalidad || !vacante.habilidades || !vacante.idiomas
  );

  if (vacantesConRelacionesFaltantes.length > 0) {
    console.log(`⚠️ VacanteListComponent - ${vacantesConRelacionesFaltantes.length} vacantes necesitan relaciones`);

    // Cargar todas las relaciones necesarias
    forkJoin({
      areas: this.vacanteService.obtenerAreas(),
      modalidades: this.vacanteService.obtenerModalidades(),
      habilidades: this.vacanteService.obtenerHabilidades(),
      idiomas: this.vacanteService.obtenerIdiomas()
    }).subscribe({
      next: (responses) => {
        console.log('✅ VacanteListComponent - Relaciones cargadas para vacantes');

        // Actualizar cada vacante con las relaciones
        this.vacantes = this.vacantes.map(vacante => {
          const vacanteActualizada = {
            ...vacante,
            area: vacante.area || responses.areas.data.find(area => area.id === this.obtenerAreaIdDeVacante(vacante)),
            modalidad: vacante.modalidad || responses.modalidades.data.find(mod => mod.id === this.obtenerModalidadIdDeVacante(vacante)),
            habilidades: vacante.habilidades || this.obtenerHabilidadesDeVacante(vacante, responses.habilidades.data),
            idiomas: vacante.idiomas || this.obtenerIdiomasDeVacante(vacante, responses.idiomas.data)
          };

          console.log('🔄 Vacante actualizada:', {
            id: vacanteActualizada.id,
            area: vacanteActualizada.area?.nombre,
            modalidad: vacanteActualizada.modalidad?.nombre,
            habilidades: vacanteActualizada.habilidades?.length,
            idiomas: vacanteActualizada.idiomas?.length
          });

          return vacanteActualizada;
        });

        // Si estamos mostrando la primera vacante, actualizarla también
        if (this.vacanteEditando && this.isEditMode) {
          const vacanteActualizada = this.vacantes.find(v => v.id === this.vacanteEditando.id);
          if (vacanteActualizada) {
            this.vacanteEditando = vacanteActualizada;
          }
        }
      },
      error: (error) => {
        console.error('❌ VacanteListComponent - Error cargando relaciones:', error);
      }
    });
  }
}

// Método alternativo más simple si sigues teniendo problemas
getVacantePrincipal(): Vacante | null {
  if (!this.vacantes || this.vacantes.length === 0) {
    return null;
  }

  // Si hay una vacante seleccionada, úsala
  if (this.vacanteEditando && this.isEditMode) {
    return this.vacanteEditando;
  }

  // Si no, usa la primera vacante de la lista
  return this.vacantes[0];
}

// Método para seleccionar una vacante al hacer clic
seleccionarVacante(vacante: Vacante): void {
  console.log('🎯 VacanteListComponent - Seleccionando vacante:', vacante.id);
  this.vacanteEditando = vacante;
  this.isEditMode = true;
}

 limpiarFiltros(): void {
  console.log('🧹 VacanteListComponent - Limpiando filtros');
  this.filtros = {
    titulo: '',
    empresa: '',
    estado: '',
    area: ''
  };
  this.cargarVacantes(); // Esto ahora mostrará la primera vacante automáticamente
}

  hayFiltrosActivos(): boolean {
    return !!(this.filtros.titulo || this.filtros.empresa || this.filtros.estado || this.filtros.area);
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
    console.log(`🔍 VacanteListComponent - Filtros ${this.mostrarFiltros ? 'mostrados' : 'ocultados'}`);
  }

  getEstadoBadgeClass(estado: string): string {
    const clases = {
      'ACTIVA': 'badge bg-success',
      'INACTIVA': 'badge bg-secondary',
      'CANCELADA': 'badge bg-danger',
      'CERRADA': 'badge bg-warning'
    };
    return clases[estado as keyof typeof clases] || 'badge bg-info';
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      'ACTIVA': 'Activa',
      'INACTIVA': 'Inactiva',
      'CANCELADA': 'Cancelada',
      'CERRADA': 'Cerrada'
    };
    return textos[estado as keyof typeof textos] || estado;
  }
}
