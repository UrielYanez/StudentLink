import { Component, OnInit } from '@angular/core';
import {
  Habilidad,
  Idioma,
  Vacante,
  Postulado,
  VacanteConPostulados,
} from '../../models/vacante-model';
import { VacanteService } from '../../service/vacante-service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VacanteMatch } from '../../models/maching';
import { UsuarioContextService } from '../../auth/Service/usuario-context-service';

@Component({
  selector: 'app-vacante-list-component',
  standalone: false,
  templateUrl: './vacante-list-component.html',
  styleUrl: './vacante-list-component.scss',
})
export class VacanteListComponent implements OnInit {
  vacantes: Vacante[] = [];
  vacantesFiltradas: Vacante[] = [];
  vacantesConPostulados: VacanteConPostulados[] = [];
  loading = false;
  error = '';
  showModal = false;
  vacanteEditando: any = null;
  isEditMode = false;

  activeTab: 'vacantes' | 'postulados' = 'vacantes';
  postuladosLoading = false;
  vacanteSeleccionadaConPostulados: VacanteConPostulados | null = null;

  mostrarFiltros = false;
  filtros = {
    titulo: '',
    estado: '',
    empresa: 'MTI'
  };
  areas: any[] = [];

  clienteId: number | null = null;
  nombreUsuario: string | null = null;
  empresaEspecifica: string = 'MTI';

  constructor(
    private vacanteService: VacanteService,
    private router: Router,
    private usuarioContextService: UsuarioContextService
  ) {}

  ngOnInit(): void {
    this.cargarVacantes();
    this.cargarAreas();
  }

  cambiarTab(tab: 'vacantes' | 'postulados'): void {
    this.activeTab = tab;

    if (tab === 'postulados') {
      this.cargarPostuladosYMatching();
    } else {
      this.vacanteSeleccionadaConPostulados = null;
    }
  }

  cargarUsuarioYVacantes(): void {
    this.usuarioContextService.usuarioCambio$.subscribe((userData) => {
      if (userData) {
        this.nombreUsuario = userData.name;
        this.clienteId = userData.id ?? null;
        this.cargarVacantes();
      }
    });

    const userData = this.usuarioContextService.getUserData();
    if (userData) {
      this.nombreUsuario = userData.name;
      this.clienteId = userData.id ?? null;
      this.cargarVacantes();
    }

    setTimeout(() => {
      if (!this.clienteId) {
        this.cargarVacantes();
      }
    }, 1000);
  }

  cargarPostuladosYMatching(): void {
    this.postuladosLoading = true;

    this.clienteId = 1;

    // if (!this.clienteId) {
    //   this.error = 'No se pudo identificar al usuario';
    //   this.postuladosLoading = false;
    //   return;
    // }

    this.vacanteService.obtenerPostuladosYMatching(this.clienteId).subscribe({
      next: (vacantesMatch: VacanteMatch[]) => {
        this.vacantesConPostulados = this.convertirVacanteMatchAVacanteConPostulados(vacantesMatch);

        if (this.vacantesConPostulados.length > 0 && !this.vacanteSeleccionadaConPostulados) {
          const primeraVacanteConPostulados = this.vacantesConPostulados.find(
            (v) => v.postulados && v.postulados.length > 0
          );
          if (primeraVacanteConPostulados) {
            this.vacanteSeleccionadaConPostulados = primeraVacanteConPostulados;
          } else if (this.vacantesConPostulados.length > 0) {
            this.vacanteSeleccionadaConPostulados = this.vacantesConPostulados[0];
          }
        }

        this.postuladosLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar postulados: ' + error.message;
        this.postuladosLoading = false;
      },
    });
  }

  private convertirVacanteMatchAVacanteConPostulados(
    vacantesMatch: VacanteMatch[]
  ): VacanteConPostulados[] {
    return vacantesMatch.map((vacanteMatch) => {
      const tienePostulados = vacanteMatch.postulados && vacanteMatch.postulados.length > 0;

      const vacanteConPostulados: VacanteConPostulados = {
        vacante_id: vacanteMatch.id,
        titulo: vacanteMatch.titulo,
        empresa: vacanteMatch.empresa,
        salario: vacanteMatch.salario,
        area: vacanteMatch.area,
        modalidad: vacanteMatch.modalidad,
        habilidades: this.formatHabilidades(vacanteMatch.habilidades),
        idiomas: this.formatIdiomas(vacanteMatch.idiomas),
        descripcion: vacanteMatch.descripcion,
        ubicacion: vacanteMatch.ubicacion,
        tipoContrato: 'Por definir',
        solicitudesPermitidas: 50,
        estado: 'ACTIVA',
        diasLaborales: vacanteMatch.dias_laborales,
        horasSemanales: vacanteMatch.horas_por_semana,
        turno: vacanteMatch.turno,
        horarioFlexible: vacanteMatch.horario_flexible,
        postulados: vacanteMatch.postulados || [],
      };

      return vacanteConPostulados;
    });
  }

  seleccionarVacanteParaPostulados(vacante: VacanteConPostulados): void {
    this.vacanteSeleccionadaConPostulados = vacante;
  }

  getMatchBadgeClass(porcentaje: number): string {
    if (porcentaje >= 80) return 'badge bg-success';
    if (porcentaje >= 60) return 'badge bg-primary';
    if (porcentaje >= 40) return 'badge bg-warning';
    return 'badge bg-secondary';
  }

  getMatchText(porcentaje: number): string {
    if (porcentaje >= 80) return 'Excelente';
    if (porcentaje >= 60) return 'Bueno';
    if (porcentaje >= 40) return 'Regular';
    return 'Bajo';
  }

  getMaxMatch(postulados: any[]): number {
    if (!postulados || postulados.length === 0) return 0;
    return Math.max(...postulados.map((p) => p.porcentaje_match || 0));
  }

  getAverageMatch(postulados: any[]): number {
    if (!postulados || postulados.length === 0) return 0;
    const sum = postulados.reduce((total, p) => total + (p.porcentaje_match || 0), 0);
    return Math.round(sum / postulados.length);
  }

  formatHabilidades(habilidades: any[]): string[] {
    if (!habilidades) return [];
    return habilidades.map((h) => (typeof h === 'string' ? h : h.nombre || '')).filter(Boolean);
  }

  formatIdiomas(idiomas: any[]): string[] {
    if (!idiomas) return [];
    return idiomas.map((i) => (typeof i === 'string' ? i : i.nombre || '')).filter(Boolean);
  }

  hayVacantesConPostulados(): boolean {
    return this.vacantesConPostulados.some((v) => v.postulados && v.postulados.length > 0);
  }

  getVacantesConPostulados(): VacanteConPostulados[] {
    return this.vacantesConPostulados.filter((v) => v.postulados && v.postulados.length > 0);
  }

  mostrarPrimeraVacante(): void {
    if (this.vacantesFiltradas.length > 0) {
      const vacantesOrdenadas = [...this.vacantesFiltradas].sort((a, b) => {
        return new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime();
      });

      const primeraVacante = vacantesOrdenadas[0];
      this.vacanteEditando = primeraVacante;
      this.isEditMode = true;

      this.cargarRelacionesParaVacante(primeraVacante);
    }
  }

  cargarAreas(): void {
    this.vacanteService.obtenerAreas().subscribe({
      next: (response) => {
        if (response.success) {
          this.areas = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando áreas:', error);
      },
    });
  }

  abrirModalNuevaVacante(): void {
    this.isEditMode = false;
    this.vacanteEditando = null;
    this.showModal = true;
  }

  abrirModalEditarVacante(vacante: Vacante): void {
    this.isEditMode = true;
    this.cargarVacanteCompleta(vacante.id!);
  }

  cargarVacanteCompleta(id: number): void {
    this.loading = true;

    this.vacanteService.obtenerVacantePorId(id).subscribe({
      next: (response) => {
        if (response.success) {
          const vacanteData = response.data;

          if (
            !vacanteData.area ||
            !vacanteData.modalidad ||
            !vacanteData.habilidades ||
            !vacanteData.idiomas
          ) {
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
      },
    });
  }

  cargarRelacionesManualmente(vacanteData: Vacante): void {
    forkJoin({
      areas: this.vacanteService.obtenerAreas(),
      modalidades: this.vacanteService.obtenerModalidades(),
      habilidades: this.vacanteService.obtenerHabilidades(),
      idiomas: this.vacanteService.obtenerIdiomas()
    }).subscribe({
      next: (responses) => {
        const areaEncontrada = responses.areas.data.find(area => area.id === this.obtenerAreaIdDeVacante(vacanteData));
        const modalidadEncontrada = responses.modalidades.data.find(mod => mod.id === this.obtenerModalidadIdDeVacante(vacanteData));

        this.vacanteEditando = {
          ...vacanteData,
          area: areaEncontrada,
          modalidad: modalidadEncontrada,
          habilidades: this.obtenerHabilidadesDeVacante(vacanteData, responses.habilidades.data),
          idiomas: this.obtenerIdiomasDeVacante(vacanteData, responses.idiomas.data)
        };

        this.showModal = true;
        this.loading = false;
      },
      error: (error) => {
        this.vacanteEditando = vacanteData;
        this.showModal = true;
        this.loading = false;
      }
    });
  }

  cerrarModal(): void {
    this.showModal = false;
    this.vacanteEditando = null;
    this.isEditMode = false;
  }

  onVacanteGuardada(): void {
    this.cerrarModal();
    this.cargarVacantes();

    if (this.vacanteEditando) {
      const vacanteId = this.vacanteEditando.id;
      setTimeout(() => {
        const vacanteActualizada = this.vacantes.find(v => v.id === vacanteId);
        if (vacanteActualizada) {
          this.cargarRelacionesParaVacante(vacanteActualizada);
        }
      }, 500);
    }
  }

  cambiarEstado(vacante: Vacante, nuevoEstado: string): void {
    this.vacanteService.cambiarEstadoVacante(vacante.id!, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          vacante.estado = nuevoEstado;
        } else {
          this.error = response.message || 'Error al cambiar estado';
        }
      },
      error: (error) => {
        this.error = 'Error de conexión: ' + error.message;
      },
    });
  }

  eliminarVacante(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta vacante?')) {
      this.vacanteService.eliminarVacante(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.vacantes = this.vacantes.filter((v) => v.id !== id);
          } else {
            this.error = response.message || 'Error al eliminar vacante';
          }
        },
        error: (error) => {
          this.error = 'Error de conexión: ' + error.message;
        },
      });
    }
  }

  aplicarFiltros(): void {
    let vacantesFiltradas = this.vacantes.filter(vacante =>
      vacante.empresa?.toLowerCase() === this.empresaEspecifica.toLowerCase()
    );

    if (this.hayFiltrosAdicionales()) {
      vacantesFiltradas = vacantesFiltradas.filter(vacante => {
        let coincide = true;

        if (this.filtros.titulo) {
          const tituloVacante = vacante.titulo?.toLowerCase() || '';
          const tituloFiltro = this.filtros.titulo.toLowerCase();
          coincide = coincide && tituloVacante.includes(tituloFiltro);
        }

        if (this.filtros.estado) {
          coincide = coincide && vacante.estado === this.filtros.estado;
        }

        return coincide;
      });
    }

    this.vacantesFiltradas = vacantesFiltradas;
    this.actualizarSeleccionDespuesDeFiltrar();
  }

  private hayFiltrosAdicionales(): boolean {
    return !!(this.filtros.titulo || this.filtros.estado);
  }

  limpiarFiltros(): void {
    this.filtros = {
      titulo: '',
      estado: '',
      empresa: this.empresaEspecifica
    };

    this.vacantesFiltradas = this.vacantes.filter(vacante =>
      vacante.empresa?.toLowerCase() === this.empresaEspecifica.toLowerCase()
    );

    if (this.vacantesFiltradas.length > 0 && !this.vacanteEditando) {
      this.seleccionarVacante(this.vacantesFiltradas[0]);
    }
  }

  private actualizarSeleccionDespuesDeFiltrar(): void {
    if (this.vacantesFiltradas.length === 0) {
      this.vacanteEditando = null;
      this.isEditMode = false;
      return;
    }

    if (this.vacanteEditando && this.vacantesFiltradas.some(v => v.id === this.vacanteEditando.id)) {
      return;
    }

    this.seleccionarVacante(this.vacantesFiltradas[0]);
  }

  getVacanteMasReciente(): Vacante | null {
    if (this.vacantesFiltradas.length === 0) {
      return null;
    }

    const vacantesOrdenadas = [...this.vacantesFiltradas].sort((a, b) => {
      if (a.fechaCreacion && b.fechaCreacion) {
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
      }
      return (b.id || 0) - (a.id || 0);
    });

    return vacantesOrdenadas[0];
  }

  seleccionarVacante(vacante: Vacante): void {
    if (!this.vacantesFiltradas.some(v => v.id === vacante.id)) {
      return;
    }

    if (this.vacanteEditando?.id === vacante.id) {
      return;
    }

    this.vacanteEditando = vacante;
    this.isEditMode = true;

    this.cargarRelacionesParaVacante(vacante);
  }

  cargarRelacionesParaVacante(vacante: Vacante): void {
    if (vacante.area && vacante.modalidad && vacante.habilidades && vacante.idiomas) {
      return;
    }

    forkJoin({
      areas: this.vacanteService.obtenerAreas(),
      modalidades: this.vacanteService.obtenerModalidades(),
      habilidades: this.vacanteService.obtenerHabilidades(),
      idiomas: this.vacanteService.obtenerIdiomas(),
    }).subscribe({
      next: (responses) => {
        const areaEncontrada = responses.areas.data.find(
          (area) => area.id === this.obtenerAreaIdDeVacante(vacante)
        );
        const modalidadEncontrada = responses.modalidades.data.find(
          (mod) => mod.id === this.obtenerModalidadIdDeVacante(vacante)
        );

        this.vacanteEditando = {
          ...vacante,
          area: areaEncontrada,
          modalidad: modalidadEncontrada,
          habilidades: this.obtenerHabilidadesDeVacante(vacante, responses.habilidades.data),
          idiomas: this.obtenerIdiomasDeVacante(vacante, responses.idiomas.data),
        };
      },
      error: (error) => {
        // Mantener la vacante aunque no se pudieron cargar las relaciones
      },
    });
  }

  hayFiltrosActivos(): boolean {
    return !!(
      this.filtros.titulo ||
      this.filtros.estado ||
      this.filtros.empresa !== this.empresaEspecifica
    );
  }

  cambiarEmpresa(nuevaEmpresa: string): void {
    this.empresaEspecifica = nuevaEmpresa;
    this.filtros.empresa = nuevaEmpresa;
    this.cargarVacantes();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases = {
      ACTIVA: 'badge bg-success',
      INACTIVA: 'badge bg-secondary',
      CANCELADA: 'badge bg-danger',
      CERRADA: 'badge bg-warning',
    };
    return clases[estado as keyof typeof clases] || 'badge bg-info';
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      ACTIVA: 'Activa',
      INACTIVA: 'Inactiva',
      CANCELADA: 'Cancelada',
      CERRADA: 'Cerrada',
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  obtenerAreaIdDeVacante(vacante: Vacante): number {
    if ((vacante as any).areaId) {
      return (vacante as any).areaId;
    }
    if (vacante.area && vacante.area.id) {
      return vacante.area.id;
    }
    if ((vacante as any).area_id) {
      return (vacante as any).area_id;
    }
    return 0;
  }

  obtenerModalidadIdDeVacante(vacante: Vacante): number {
    if ((vacante as any).modalidadId) {
      return (vacante as any).modalidadId;
    }
    if (vacante.modalidad && vacante.modalidad.id) {
      return vacante.modalidad.id;
    }
    if ((vacante as any).modalidad_id) {
      return (vacante as any).modalidad_id;
    }
    return 0;
  }

  obtenerHabilidadesDeVacante(vacante: Vacante, todasHabilidades: Habilidad[]): Habilidad[] {
    if (vacante.habilidades && vacante.habilidades.length > 0 && vacante.habilidades[0].id) {
      return vacante.habilidades as Habilidad[];
    }
    if ((vacante as any).habilidadesIds && Array.isArray((vacante as any).habilidadesIds)) {
      return todasHabilidades.filter(h => (vacante as any).habilidadesIds.includes(h.id));
    }
    if ((vacante as any).habilidades_ids && Array.isArray((vacante as any).habilidades_ids)) {
      return todasHabilidades.filter(h => (vacante as any).habilidades_ids.includes(h.id));
    }
    return [];
  }

  obtenerIdiomasDeVacante(vacante: Vacante, todosIdiomas: Idioma[]): Idioma[] {
    if (vacante.idiomas && vacante.idiomas.length > 0 && vacante.idiomas[0].id) {
      return vacante.idiomas as Idioma[];
    }
    if ((vacante as any).idiomasIds && Array.isArray((vacante as any).idiomasIds)) {
      return todosIdiomas.filter(i => (vacante as any).idiomasIds.includes(i.id));
    }
    if ((vacante as any).idiomas_ids && Array.isArray((vacante as any).idiomas_ids)) {
      return todosIdiomas.filter(i => (vacante as any).idiomas_ids.includes(i.id));
    }
    return [];
  }

  cargarVacantes(): void {
    this.loading = true;

    this.vacanteService.obtenerVacantes().subscribe({
      next: (response) => {
        if (response.success) {
          this.vacantes = response.data;

          this.vacantesFiltradas = this.vacantes.filter(vacante =>
            vacante.empresa?.toLowerCase() === this.empresaEspecifica.toLowerCase()
          );

          if (this.vacantesFiltradas.length > 0) {
            this.mostrarPrimeraVacante();
          } else {
            this.vacanteEditando = null;
            this.isEditMode = false;
          }
        } else {
          this.error = response.message || 'Error al cargar vacantes';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error de conexión: ' + error.message;
        this.loading = false;
      },
    });
  }
}
