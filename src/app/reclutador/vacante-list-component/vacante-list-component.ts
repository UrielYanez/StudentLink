import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Habilidad,
  Idioma,
  Vacante,
  Postulado,
  VacanteConPostulados,
} from '../../models/vacante-model';
import { VacanteService } from '../../service/vacante-service';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { VacanteMatch } from '../../models/maching';
import { UsuarioContextService } from '../../auth/Service/usuario-context-service';
import { EmpresaContextService } from '../../auth/Service/empresa-context-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vacante-list-component',
  standalone: false,
  templateUrl: './vacante-list-component.html',
  styleUrl: './vacante-list-component.scss',
})
export class VacanteListComponent implements OnInit, OnDestroy {
  // Arrays principales de datos
  vacantes: Vacante[] = [];
  vacantesFiltradas: Vacante[] = [];
  vacantesConPostulados: VacanteConPostulados[] = [];

  // Estados de carga y errores
  loading = false;
  error = '';
  postuladosLoading = false;

  // Control de modales y edición
  showModal = false;
  vacanteEditando: any = null;
  isEditMode = false;

  // Control de pestañas
  activeTab: 'vacantes' | 'postulados' = 'vacantes';
  vacanteSeleccionadaConPostulados: VacanteConPostulados | null = null;

  // Filtros
  mostrarFiltros = false;
  filtros = {
    titulo: '',
    estado: '',
  };
  areas: any[] = [];

  // Información del usuario y empresa
  clienteId: number | null = null;
  nombreUsuario: string | null = null;
  empresaId: number | null = null;
  nombreEmpresa: string | null = null;
  private empresaSubscription: Subscription = new Subscription();

  constructor(
    private vacanteService: VacanteService,
    private router: Router,
    private usuarioContextService: UsuarioContextService,
    private empresaContextService: EmpresaContextService
  ) {}

  /**
   * Inicialización del componente
   */
  ngOnInit(): void {
    this.cargarUsuarioYEmpresa();
    this.cargarVacantes();
    this.cargarAreas();
  }

  /**
   * Limpieza de suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.empresaSubscription.unsubscribe();
  }

  /**
   * Carga la información del usuario y empresa dinámicamente
   */
  cargarUsuarioYEmpresa(): void {
    // Suscripción a cambios en el usuario
    this.usuarioContextService.usuarioCambio$.subscribe((userData) => {
      if (userData) {
        this.nombreUsuario = userData.name;
        this.clienteId = userData.id ?? null;
        console.log('Usuario cargado exitosamente:', {
          nombre: this.nombreUsuario,
          id: this.clienteId,
        });
      } else {
        console.log('No se encontraron datos de usuario');
      }
    });

    // Suscripción a cambios en la empresa
    this.empresaSubscription.add(
      this.empresaContextService.empresaActual$.subscribe((empresa) => {
        if (empresa) {
          this.empresaId = empresa.id ?? null;
          this.nombreEmpresa = empresa.nombre ?? null;
          console.log('Empresa cargada exitosamente:', {
            id: this.empresaId,
            nombre: this.nombreEmpresa,
          });

          // Recargar vacantes cuando cambia la empresa
          this.cargarVacantes();
        } else {
          console.log('No hay empresa seleccionada');
          this.empresaId = null;
          this.nombreEmpresa = null;
        }
      })
    );

    // Cargar datos iniciales
    const userData = this.usuarioContextService.getUserData();
    if (userData) {
      this.nombreUsuario = userData.name;
      this.clienteId = userData.id ?? null;
    }

    const empresaActual = this.empresaContextService.getEmpresaActual();
    if (empresaActual) {
      this.empresaId = empresaActual.id ?? null;
      this.nombreEmpresa = empresaActual.nombre ?? null;
    }
  }

  /**
   * Obtiene el nombre de una habilidad de manera segura
   */
  getNombreHabilidad(habilidad: any): string {
    if (typeof habilidad === 'string') return habilidad;
    if (habilidad && typeof habilidad === 'object' && habilidad.nombre) {
      return habilidad.nombre;
    }
    return 'Habilidad no especificada';
  }

  /**
   * Obtiene el nombre de un idioma de manera segura
   */
  getNombreIdioma(idioma: any): string {
    if (typeof idioma === 'string') return idioma;
    if (idioma && typeof idioma === 'object') {
      if (idioma.idioma) return idioma.idioma;
      if (idioma.nombre) return idioma.nombre;
    }
    return 'Idioma no especificado';
  }

  /**
   * Obtiene el nombre de la empresa para mostrar
   */
  getNombreEmpresa(empresaId: number | undefined | null): string {
    if (empresaId === this.empresaId && this.nombreEmpresa) {
      return this.nombreEmpresa;
    }
    return `Empresa ${empresaId ?? 'N/A'}`;
  }

  /**
   * Verifica si hay una empresa seleccionada
   */
  get hayEmpresaSeleccionada(): boolean {
    return this.empresaId !== null && this.empresaId !== undefined;
  }

  /**
   * Cambia entre las pestañas de vacantes y postulados
   */
  cambiarTab(tab: 'vacantes' | 'postulados'): void {
    this.activeTab = tab;

    if (tab === 'postulados') {
      this.cargarPostuladosYMatching();
    } else {
      this.vacanteSeleccionadaConPostulados = null;
    }
  }

  /**
   * Carga los postulados y información de matching
   */
  cargarPostuladosYMatching(): void {
    this.postuladosLoading = true;

    if (!this.clienteId) {
      this.mostrarError('No se pudo identificar al usuario');
      this.postuladosLoading = false;
      return;
    }

    this.vacanteService.obtenerPostuladosYMatching(this.clienteId).subscribe({
      next: (vacantesMatch: VacanteMatch[]) => {
        let vacantesFiltradas = vacantesMatch;

        // Solo filtrar si realmente tenemos empresaId y las vacantes tienen empresaId
        if (this.empresaId) {
          // Opción 1: Si las vacantes tienen empresaId numérico
          vacantesFiltradas = vacantesMatch.filter((vacante) => {
            // Verificar si la vacante tiene empresaId que coincida
            const vacanteEmpresaId = vacante.empresa || (vacante as any).empresa_id;
            return vacanteEmpresaId === this.empresaId;
          });

          // Si no hay resultados, mostrar todas para debugging
          if (vacantesFiltradas.length === 0) {
            vacantesFiltradas = vacantesMatch;
          }
        }

        this.vacantesConPostulados =
          this.convertirVacanteMatchAVacanteConPostulados(vacantesFiltradas);

        // Seleccionar la primera vacante con postulados si existe
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
        // Mostrar información detallada para debugging
        console.log('Resumen de postulados:', {
          totalVacantesRecibidas: vacantesMatch.length,
          vacantesFiltradas: vacantesFiltradas.length,
          vacantesConPostulados: this.vacantesConPostulados.length,
          vacantesConPostuladosArray: this.vacantesConPostulados.map((v) => ({
            titulo: v.titulo,
            postuladosCount: v.postulados?.length || 0,
            empresaId: v.empresaId,
          })),
        });

        if (this.vacantesConPostulados.length === 0) {
          this.mostrarInfo(
            'No hay postulados',
            'No se encontraron postulados para las vacantes actuales.'
          );
        } else {
          const totalPostulados = this.vacantesConPostulados.reduce(
            (total, v) => total + (v.postulados?.length || 0),
            0
          );
        }
      },
      error: (error) => {
        this.mostrarError('Error al cargar postulados: ' + error.message);
        this.postuladosLoading = false;
      },
    });
  }

  /**
   * Convierte VacanteMatch a VacanteConPostulados - VERSIÓN SIMPLIFICADA
   */
  private convertirVacanteMatchAVacanteConPostulados(
    vacantesMatch: VacanteMatch[]
  ): VacanteConPostulados[] {
    console.log('🔄 Convirtiendo VacanteMatch a VacanteConPostulados');

    return vacantesMatch.map((vacanteMatch) => {
      const nombresHabilidades = this.extraerNombresHabilidades(vacanteMatch.habilidades);
      const nombresIdiomas = this.extraerNombresIdiomas(vacanteMatch.idiomas);
      const empresaId = this.empresaId || vacanteMatch.empresa || 0;

      const vacanteConPostulados: VacanteConPostulados = {
        vacante_id: vacanteMatch.id,
        titulo: vacanteMatch.titulo,
        empresaId: vacanteMatch.empresa,
        salario: vacanteMatch.salario,
        area: vacanteMatch.area,
        modalidad: vacanteMatch.modalidad,
        habilidades: nombresHabilidades,
        idiomas: nombresIdiomas,
        descripcion: vacanteMatch.descripcion,
        tipoContrato: 'Por definir',
        solicitudesPermitidas: 50,
        estado: 'ACTIVA',
        diasLaborales: vacanteMatch.dias_laborales,
        horasSemanales: vacanteMatch.horas_por_semana,
        turno: vacanteMatch.turno,
        horarioFlexible: vacanteMatch.horario_flexible,
        postulados: vacanteMatch.postulados || [],
        empresaNombre: this.nombreEmpresa || this.getNombreEmpresa(empresaId),
      };
      console.log(`Vacante convertida: ${vacanteConPostulados.titulo}`, {
        empresaId: empresaId,
        empresaNombre: vacanteConPostulados.empresaNombre,
      });

      return vacanteConPostulados;
    });
  }
  /**
   * Extrae nombres de habilidades de manera segura
   */
  private extraerNombresHabilidades(habilidades: any): string[] {
    try {
      if (!habilidades || !Array.isArray(habilidades)) {
        return [];
      }

      const nombres: string[] = [];

      habilidades.forEach((item: any) => {
        if (typeof item === 'string' && item.trim()) {
          nombres.push(item.trim());
        } else if (item && typeof item === 'object') {
          if (item.nombre && typeof item.nombre === 'string' && item.nombre.trim()) {
            nombres.push(item.nombre.trim());
          } else if (
            item.habilidad &&
            typeof item.habilidad === 'string' &&
            item.habilidad.trim()
          ) {
            nombres.push(item.habilidad.trim());
          }
        }
      });

      return nombres;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extrae nombres de idiomas de manera segura
   */
  private extraerNombresIdiomas(idiomas: any): string[] {
    try {
      if (!idiomas || !Array.isArray(idiomas)) {
        return [];
      }

      const nombres: string[] = [];

      idiomas.forEach((item: any) => {
        if (typeof item === 'string' && item.trim()) {
          nombres.push(item.trim());
        } else if (item && typeof item === 'object') {
          if (item.idioma && typeof item.idioma === 'string' && item.idioma.trim()) {
            nombres.push(item.idioma.trim());
          } else if (item.nombre && typeof item.nombre === 'string' && item.nombre.trim()) {
            nombres.push(item.nombre.trim());
          }
        }
      });

      return nombres;
    } catch (error) {
      return [];
    }
  }

  /**
   * Selecciona una vacante para ver sus postulados
   */
  seleccionarVacanteParaPostulados(vacante: VacanteConPostulados): void {
    this.vacanteSeleccionadaConPostulados = vacante;
  }

  /**
   * Obtiene la clase CSS para el badge de matching
   */
  getMatchBadgeClass(porcentaje: number): string {
    if (porcentaje >= 80) return 'badge bg-success';
    if (porcentaje >= 60) return 'badge bg-primary';
    if (porcentaje >= 40) return 'badge bg-warning';
    return 'badge bg-secondary';
  }

  /**
   * Obtiene el texto descriptivo para el matching
   */
  getMatchText(porcentaje: number): string {
    if (porcentaje >= 80) return 'Excelente';
    if (porcentaje >= 60) return 'Bueno';
    if (porcentaje >= 40) return 'Regular';
    return 'Bajo';
  }

  /**
   * Obtiene el máximo porcentaje de matching entre postulados
   */
  getMaxMatch(postulados: any[]): number {
    if (!postulados || postulados.length === 0) return 0;
    return Math.max(...postulados.map((p) => p.porcentaje_match || 0));
  }

  /**
   * Obtiene el promedio de matching entre postulados
   */
  getAverageMatch(postulados: any[]): number {
    if (!postulados || postulados.length === 0) return 0;
    const sum = postulados.reduce((total, p) => total + (p.porcentaje_match || 0), 0);
    return Math.round(sum / postulados.length);
  }

  /**
   * Verifica si hay vacantes con postulados
   */
  hayVacantesConPostulados(): boolean {
    return this.vacantesConPostulados.some((v) => v.postulados && v.postulados.length > 0);
  }

  /**
   * Obtiene las vacantes que tienen postulados
   */
  getVacantesConPostulados(): VacanteConPostulados[] {
    return this.vacantesConPostulados.filter((v) => v.postulados && v.postulados.length > 0);
  }

  /**
   * Carga las áreas disponibles
   */
  cargarAreas(): void {
    this.vacanteService.obtenerAreas().subscribe({
      next: (response) => {
        if (response.success) {
          this.areas = response.data;
        } else {
          console.error('Error en respuesta de áreas:', response.message);
        }
      },
      error: (error) => {
        console.error('Error cargando áreas:', error);
      },
    });
  }

  /**
   * Abre el modal para crear nueva vacante
   */
  abrirModalNuevaVacante(): void {
    this.isEditMode = false;
    this.vacanteEditando = null;
    this.showModal = true;
  }

  /**
   * Abre el modal para editar vacante existente
   */
  abrirModalEditarVacante(vacante: Vacante): void {
    this.isEditMode = true;
    this.cargarVacanteCompleta(vacante.id!);
  }

  /**
   * Carga una vacante completa por ID
   */
  cargarVacanteCompleta(id: number): void {
    this.loading = true;

    this.vacanteService.obtenerVacantePorId(id).subscribe({
      next: (response) => {
        if (response.success) {
          const vacanteData = response.data;

          // Verificar si necesita cargar relaciones manualmente
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
          this.mostrarError(response.message || 'Error al cargar vacante');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error de conexión al cargar vacante:', error);
        this.mostrarError('Error de conexión: ' + error.message);
        this.loading = false;
      },
    });
  }

  /**
   * Carga las relaciones de la vacante manualmente
   */
  cargarRelacionesManualmente(vacanteData: Vacante): void {
    forkJoin({
      areas: this.vacanteService.obtenerAreas(),
      modalidades: this.vacanteService.obtenerModalidades(),
      habilidades: this.vacanteService.obtenerHabilidades(),
      idiomas: this.vacanteService.obtenerIdiomas(),
    }).subscribe({
      next: (responses) => {

        const areaEncontrada = responses.areas.data.find(
          (area) => area.id === this.obtenerAreaIdDeVacante(vacanteData)
        );
        const modalidadEncontrada = responses.modalidades.data.find(
          (mod) => mod.id === this.obtenerModalidadIdDeVacante(vacanteData)
        );

        this.vacanteEditando = {
          ...vacanteData,
          area: areaEncontrada,
          modalidad: modalidadEncontrada,
          habilidades: this.obtenerHabilidadesDeVacante(vacanteData, responses.habilidades.data),
          idiomas: this.obtenerIdiomasDeVacante(vacanteData, responses.idiomas.data),
        };

        this.showModal = true;
        this.loading = false;
      },
      error: (error) => {
        this.vacanteEditando = vacanteData;
        this.showModal = true;
        this.loading = false;
      },
    });
  }

  /**
   * Cierra el modal de vacante
   */
  cerrarModal(): void {
    this.showModal = false;
    this.vacanteEditando = null;
    this.isEditMode = false;
  }

  /**
   * Maneja el evento cuando se guarda una vacante
   */
  onVacanteGuardada(): void {
    this.cerrarModal();
    this.cargarVacantes();
    this.mostrarExito('Vacante guardada exitosamente');
  }

  /**
   * Cambia el estado de una vacante
   */
  cambiarEstado(vacante: Vacante, nuevoEstado: string): void {
    const estadoTexto = this.getEstadoTexto(nuevoEstado);

    Swal.fire({
      title: `¿Cambiar estado a ${estadoTexto.toLowerCase()}?`,
      text: `La vacante "${vacante.titulo}" cambiará su estado a ${estadoTexto}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vacanteService.cambiarEstadoVacante(vacante.id!, nuevoEstado).subscribe({
          next: (response) => {
            if (response.success) {
              vacante.estado = nuevoEstado;
              this.mostrarExito(`Estado cambiado a ${estadoTexto}`);
            } else {
              this.mostrarError(response.message || 'Error al cambiar estado');
            }
          },
          error: (error) => {
            this.mostrarError('Error de conexión: ' + error.message);
          },
        });
      } else {
        console.log('Cambio de estado cancelado por el usuario');
      }
    });
  }

  /**
   * Elimina una vacante
   */
  eliminarVacante(id: number): void {
    const vacante = this.vacantes.find((v) => v.id === id);

    Swal.fire({
      title: '¿Eliminar vacante?',
      text: `¿Estás seguro de que deseas eliminar la vacante "${vacante?.titulo}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.vacanteService.eliminarVacante(id).subscribe({
          next: (response) => {
            if (response.success) {
              this.vacantes = this.vacantes.filter((v) => v.id !== id);
              this.vacantesFiltradas = this.vacantesFiltradas.filter((v) => v.id !== id);
              this.mostrarExito('Vacante eliminada exitosamente');

              // Limpiar si la vacante eliminada era la que se estaba editando
              if (this.vacanteEditando?.id === id) {
                this.vacanteEditando = null;
                this.isEditMode = false;
              }
            } else {
              this.mostrarError(response.message || 'Error al eliminar vacante');
            }
          },
          error: (error) => {
            this.mostrarError('Error de conexión: ' + error.message);
          },
        });
      } else {
        console.log('Eliminación cancelada por el usuario');
      }
    });
  }

  /**
   * Aplica los filtros a las vacantes
   */
  aplicarFiltros(): void {
    let vacantesFiltradas = this.vacantes;

    // Filtrar por empresa si está seleccionada
    if (this.empresaId) {
      vacantesFiltradas = vacantesFiltradas.filter(
        (vacante) => vacante.empresaId === this.empresaId
      );
    }

    // Aplicar filtros adicionales
    if (this.hayFiltrosAdicionales()) {
      vacantesFiltradas = vacantesFiltradas.filter((vacante) => {
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

    if (this.vacantesFiltradas.length === 0 && this.hayFiltrosAdicionales()) {
      console.log('No se encontraron vacantes con los filtros aplicados');
      this.mostrarInfo(
        'Sin resultados',
        'No se encontraron vacantes que coincidan con los filtros aplicados.'
      );
    }
  }

  /**
   * Verifica si hay filtros adicionales activos
   */
  private hayFiltrosAdicionales(): boolean {
    return !!(this.filtros.titulo || this.filtros.estado);
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtros = {
      titulo: '',
      estado: '',
    };

    // Mantener filtro por empresa pero limpiar los demás
    if (this.empresaId) {
      this.vacantesFiltradas = this.vacantes.filter(
        (vacante) => vacante.empresaId === this.empresaId
      );
    } else {
      this.vacantesFiltradas = [...this.vacantes];
    }

    if (this.vacantesFiltradas.length > 0 && !this.vacanteEditando) {
      this.seleccionarVacante(this.vacantesFiltradas[0]);
    }

    this.mostrarInfo('Filtros limpiados', 'Se han restablecido todos los filtros.');
  }

  /**
   * Actualiza la selección después de filtrar
   */
  private actualizarSeleccionDespuesDeFiltrar(): void {
    if (this.vacantesFiltradas.length === 0) {
      this.vacanteEditando = null;
      this.isEditMode = false;
      return;
    }

    // Mantener la selección actual si todavía está en los resultados filtrados
    if (
      this.vacanteEditando &&
      this.vacantesFiltradas.some((v) => v.id === this.vacanteEditando.id)
    ) {
      return;
    }

    // Seleccionar la primera vacante filtrada
    this.seleccionarVacante(this.vacantesFiltradas[0]);
  }

  /**
   * Selecciona una vacante para editar
   */
  seleccionarVacante(vacante: Vacante): void {
    if (!this.vacantesFiltradas.some((v) => v.id === vacante.id)) {
      return;
    }

    if (this.vacanteEditando?.id === vacante.id) {
      return;
    }

    this.vacanteEditando = vacante;
    this.isEditMode = true;

    this.cargarRelacionesParaVacante(vacante);
  }

  /**
   * Carga las relaciones de una vacante (área, modalidad, habilidades, idiomas)
   */
  cargarRelacionesParaVacante(vacante: Vacante): void {

    // Si ya tiene las relaciones cargadas, no hacer nada
    if (vacante.area && vacante.modalidad && vacante.habilidades && vacante.idiomas) {
      this.vacanteEditando = vacante;
      return;
    }

    this.loading = true;

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

        const habilidadesEncontradas = this.obtenerHabilidadesDeVacante(
          vacante,
          responses.habilidades.data
        );
        const idiomasEncontrados = this.obtenerIdiomasDeVacante(vacante, responses.idiomas.data);

        console.log('Relaciones encontradas:', {
          area: areaEncontrada?.nombre,
          modalidad: modalidadEncontrada?.nombre,
          habilidades: habilidadesEncontradas.length,
          idiomas: idiomasEncontrados.length,
        });

        // Actualizar la vacante en edición
        this.vacanteEditando = {
          ...vacante,
          area: areaEncontrada,
          modalidad: modalidadEncontrada,
          habilidades: habilidadesEncontradas,
          idiomas: idiomasEncontrados,
        };

        // Actualizar también en el array de vacantes filtradas
        const index = this.vacantesFiltradas.findIndex((v) => v.id === vacante.id);
        if (index > -1) {
          this.vacantesFiltradas[index] = {
            ...this.vacantesFiltradas[index],
            area: areaEncontrada,
            modalidad: modalidadEncontrada,
            habilidades: habilidadesEncontradas,
            idiomas: idiomasEncontrados,
          };
        }

        this.loading = false;
      },
      error: (error) => {
        this.mostrarError('Error al cargar información adicional de la vacante');
        this.loading = false;
      },
    });
  }

  /**
   * Obtiene las habilidades de una vacante
   */
  obtenerHabilidadesDeVacante(vacante: Vacante, todasHabilidades: Habilidad[]): Habilidad[] {

    // Caso 1: Ya tiene habilidades cargadas como objetos
    if (vacante.habilidades && vacante.habilidades.length > 0 && vacante.habilidades[0].id) {
      return vacante.habilidades as Habilidad[];
    }

    // Caso 2: Tiene array de IDs de habilidades
    if ((vacante as any).habilidadesIds && Array.isArray((vacante as any).habilidadesIds)) {
      const habilidades = todasHabilidades.filter((h) =>
        (vacante as any).habilidadesIds.includes(h.id)
      );
      return habilidades;
    }

    // Caso 3: Tiene array de IDs con nombre diferente
    if ((vacante as any).habilidades_ids && Array.isArray((vacante as any).habilidades_ids)) {
      const habilidades = todasHabilidades.filter((h) =>
        (vacante as any).habilidades_ids.includes(h.id)
      );
      return habilidades;
    }

    return [];
  }

  /**
   * Obtiene los idiomas de una vacante
   */
  obtenerIdiomasDeVacante(vacante: Vacante, todosIdiomas: Idioma[]): Idioma[] {

    // Caso 1: Ya tiene idiomas cargados como objetos
    if (vacante.idiomas && vacante.idiomas.length > 0 && vacante.idiomas[0].id) {
      console.log('✅ Idiomas ya cargados como objetos');
      return vacante.idiomas as Idioma[];
    }

    // Caso 2: Tiene array de IDs de idiomas
    if ((vacante as any).idiomasIds && Array.isArray((vacante as any).idiomasIds)) {
      const idiomas = todosIdiomas.filter((i) => (vacante as any).idiomasIds.includes(i.id));
      return idiomas;
    }

    // Caso 3: Tiene array de IDs con nombre diferente
    if ((vacante as any).idiomas_ids && Array.isArray((vacante as any).idiomas_ids)) {
      const idiomas = todosIdiomas.filter((i) => (vacante as any).idiomas_ids.includes(i.id));
      return idiomas;
    }

    return [];
  }

  /**
   * Verifica si hay filtros activos
   */
  hayFiltrosActivos(): boolean {
    return !!(this.filtros.titulo || this.filtros.estado);
  }

  /**
   * Muestra/oculta los filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getEstadoBadgeClass(estado: string): string {
    const clases = {
      ACTIVA: 'badge bg-success',
      INACTIVA: 'badge bg-secondary',
      CANCELADA: 'badge bg-danger',
      CERRADA: 'badge bg-warning',
    };
    return clases[estado as keyof typeof clases] || 'badge bg-info';
  }

  /**
   * Obtiene el texto descriptivo para el estado
   */
  getEstadoTexto(estado: string): string {
    const textos = {
      ACTIVA: 'Activa',
      INACTIVA: 'Inactiva',
      CANCELADA: 'Cancelada',
      CERRADA: 'Cerrada',
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  /**
   * Obtiene el ID del área de una vacante
   */
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

  /**
   * Obtiene el ID de la modalidad de una vacante
   */
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

  /**
   * Formatea las habilidades para mostrar
   */
  getHabilidadesParaMostrar(vacante: Vacante): string {
    if (!vacante.habilidades || vacante.habilidades.length === 0) {
      return 'No se han especificado habilidades para este puesto';
    }

    const habilidadesArray: string[] = [];

    for (const h of vacante.habilidades) {
      if (typeof h === 'string') {
        habilidadesArray.push(h);
      } else if (h && typeof h === 'object' && 'nombre' in h) {
        habilidadesArray.push(h.nombre);
      }
    }

    return habilidadesArray.length > 0
      ? habilidadesArray.join(', ')
      : 'No se han especificado habilidades para este puesto';
  }

  /**
   * Formatea los idiomas para mostrar
   */
  getIdiomasParaMostrar(vacante: Vacante): string {
    if (!vacante.idiomas || vacante.idiomas.length === 0) {
      return 'No se han especificado idiomas para este puesto';
    }

    const idiomasArray: string[] = [];

    for (const i of vacante.idiomas) {
      if (typeof i === 'string') {
        idiomasArray.push(i);
      } else if (i && typeof i === 'object' && 'idioma' in i) {
        idiomasArray.push(i.idioma);
      }
    }

    return idiomasArray.length > 0
      ? idiomasArray.join(', ')
      : 'No se han especificado idiomas para este puesto';
  }

  /**
   * Verifica si una vacante tiene habilidades
   */
  tieneHabilidades(vacante: Vacante): boolean {
    return !!(vacante.habilidades && vacante.habilidades.length > 0);
  }

  /**
   * Verifica si una vacante tiene idiomas
   */
  tieneIdiomas(vacante: Vacante): boolean {
    return !!(vacante.idiomas && vacante.idiomas.length > 0);
  }

  /**
   * Carga todas las vacantes
   */
  cargarVacantes(): void {
    console.log('📥 Iniciando carga de vacantes');
    this.loading = true;

    this.vacanteService.obtenerVacantes().subscribe({
      next: (response) => {
        if (response.success) {
          this.vacantes = response.data;
          console.log(`✅ ${this.vacantes.length} vacantes cargadas`);

          // Filtrar por empresaId dinámico
          if (this.empresaId) {
            this.vacantesFiltradas = this.vacantes.filter(
              (vacante) => vacante.empresaId === this.empresaId
            );
            console.log(
              `🏢 ${this.vacantesFiltradas.length} vacantes filtradas para empresa ${this.empresaId}`
            );
          } else {
            this.vacantesFiltradas = [...this.vacantes];
            console.log('🏢 Mostrando todas las vacantes (sin filtro de empresa)');
          }

          if (this.vacantesFiltradas.length > 0) {
            this.mostrarPrimeraVacante();
          } else {
            this.vacanteEditando = null;
            this.isEditMode = false;
            console.log('ℹ️ No hay vacantes para mostrar');
            this.mostrarInfo('Sin vacantes', 'No se encontraron vacantes para mostrar.');
          }
        } else {
          console.error('❌ Error en respuesta de vacantes:', response.message);
          this.mostrarError(response.message || 'Error al cargar vacantes');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error de conexión al cargar vacantes:', error);
        this.mostrarError('Error de conexión: ' + error.message);
        this.loading = false;
      },
    });
  }

  /**
   * Muestra la primera vacante más reciente
   */
  private mostrarPrimeraVacante(): void {
    if (this.vacantesFiltradas.length > 0) {
      const vacantesOrdenadas = [...this.vacantesFiltradas].sort((a, b) => {
        return new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime();
      });

      const primeraVacante = vacantesOrdenadas[0];
      console.log(`🎯 Mostrando primera vacante: ${primeraVacante.titulo}`);
      this.vacanteEditando = primeraVacante;
      this.isEditMode = true;

      this.cargarRelacionesParaVacante(primeraVacante);
    }
  }

  /**
   * Muestra un mensaje de éxito
   */
  private mostrarExito(mensaje: string): void {
    console.log(`✅ Mostrando mensaje de éxito: ${mensaje}`);
    Swal.fire({
      title: '¡Éxito!',
      text: mensaje,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar',
      timer: 3000,
    });
  }

  /**
   * Muestra un mensaje de error
   */
  private mostrarError(mensaje: string): void {
    console.error(`❌ Mostrando mensaje de error: ${mensaje}`);
    Swal.fire({
      title: 'Error',
      text: mensaje,
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
    });
  }

  /**
   * Muestra un mensaje informativo
   */
  private mostrarInfo(titulo: string, mensaje: string): void {
    console.log(`ℹ️ Mostrando mensaje informativo: ${titulo} - ${mensaje}`);
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar',
      timer: 3000,
    });
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
}
