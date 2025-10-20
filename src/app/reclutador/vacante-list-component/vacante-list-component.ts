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

  cargarVacantes(): void {
    console.log('📥 VacanteListComponent - Cargando vacantes...');
    this.loading = true;
    this.vacanteService.obtenerVacantes().subscribe({
      next: (response) => {
        console.log('✅ VacanteListComponent - Respuesta recibida:', response);
        if (response.success) {
          this.vacantes = response.data;
          console.log(`📊 VacanteListComponent - ${this.vacantes.length} vacantes cargadas`);
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

  limpiarFiltros(): void {
    console.log('🧹 VacanteListComponent - Limpiando filtros');
    this.filtros = {
      titulo: '',
      empresa: '',
      estado: '',
      area: ''
    };
    this.cargarVacantes();
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
