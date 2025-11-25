import { Component, OnInit } from '@angular/core';
import { MatchingRequest, VacanteMatch } from '../../models/maching';
import { Maching } from '../../service/maching';
import { UsuarioContextService } from '../../auth/Service/usuario-context-service';
import Swal from 'sweetalert2';
import { VacanteService } from '../../service/vacante-service';
import { Area, Habilidad, Idioma, Modalidad } from '../../models/vacante-model';
import { CompetenciaObserverService } from '../../service/competencia.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class homeMaching implements OnInit {

  /** ============================
   *  VARIABLES PRINCIPALES
   *  ============================ */
  tipo: number = 1;

  // Modal de competencia
  mostrarModalCompetencia: boolean = false;
  vacanteCompetencia: VacanteMatch | null = null;

  // Listas de vacantes
  ofertas: VacanteMatch[] = [];
  ofertasOriginales: VacanteMatch[] = [];
  selectedVacante: VacanteMatch | null = null;

  // Datos del usuario
  nombreUsuarioGlobal: string | null = null;
  idUsuarioGlobal: number | null = null;
  emailll: string | null = null;

  // Catálogos
  turnos: string[] = ['Matutino', 'Vespertino', 'Nocturno', 'Mixto', 'Flexible'];
  areas: Area[] = [];
  habilidades: Habilidad[] = [];
  habilidadesFiltradas: Habilidad[] = [];
  idiomas: Idioma[] = [];
  modalidades: Modalidad[] = [];

  // Estado de filtros
  mostrarFiltros = false;
  aplicandoFiltros = false;

  // Filtros
  filtros: MatchingRequest = {
    tipo: this.tipo,
    clienteId: this.idUsuarioGlobal!
  };

  constructor(
    private matchingService: Maching,
    private usuarioContextService: UsuarioContextService,
    private vacanteService: VacanteService,
    private competenciaService: CompetenciaObserverService
  ) {}

  /** ============================
   *  INICIALIZACIÓN
   *  ============================ */
  ngOnInit() {
    this.cargarCatalogos();

    // Suscripción a cambios de usuario
    this.usuarioContextService.usuarioCambio$.subscribe((userData) => {
      if (userData) {
        this.nombreUsuarioGlobal = userData.name;
        this.idUsuarioGlobal = userData.id ?? null;
       this.obtenerMatching();
      }
    });

    // Cargar datos de usuario si ya existen
    const savedUser = this.usuarioContextService.getUserData();
    if (savedUser) {
      this.nombreUsuarioGlobal = savedUser.name;
      this.emailll = savedUser.email;
      this.idUsuarioGlobal = savedUser.id ?? null;
     this.obtenerMatching();
    }
  }

  /** ============================
   *  CONSULTA INICIAL DE VACANTES
   *  ============================ */
  cargarVacantesIniciales() {
    const request: MatchingRequest = {
      tipo: this.tipo,
      clienteId: this.idUsuarioGlobal!
    };

    this.matchingService.postMatching(request).subscribe({
      next: (data) => {
        this.ofertas = data;
        this.ofertasOriginales = [...data];
        this.selectedVacante = this.ofertas[0] || null;
      },
      error: () => console.error('Error al cargar vacantes')
    });
  }

  get cantidadOfertas(): number {
    return this.ofertas.length;
  }

  /** ============================
   *  FILTROS
   *  ============================ */
  aplicarFiltros() {
    this.aplicandoFiltros = true;

    const request: MatchingRequest = {
      tipo: 4,
      clienteId: this.idUsuarioGlobal!
    };

    // Solo enviar filtros usados
    if (this.filtros.salario) request.salario = this.filtros.salario;
    if (this.filtros.modalidad) request.modalidad = this.filtros.modalidad;
    if (this.filtros.area) request.area = this.filtros.area;
    if (this.filtros.titulo) request.titulo = this.filtros.titulo;
    if (this.filtros.horario) request.horario = this.filtros.horario;

    this.matchingService.postMatching(request).subscribe({
      next: (data) => {
        this.ofertas = data;
        this.selectedVacante = this.ofertas[0] || null;
        this.aplicandoFiltros = false;
      },
      error: () => {
        console.error('Error al aplicar filtros');
        this.aplicandoFiltros = false;
      }
    });
  }

  limpiarFiltros() {
    this.filtros = {
      tipo: this.tipo,
      clienteId: this.idUsuarioGlobal!
    };
   this.obtenerMatching();
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  hayFiltrosActivos(): boolean {
    return !!(this.filtros.salario || this.filtros.modalidad || this.filtros.area || this.filtros.titulo || this.filtros.horario);
  }

  /** ============================
   *  SELECCIÓN DE VACANTE
   *  ============================ */
  selectVacante(vacante: VacanteMatch) {
    this.selectedVacante = vacante;
  }

  /** ============================
   *  POSTULARSE
   *  ============================ */
  Postularse(idVacante: number): void {
    const request: MatchingRequest = {
      tipo: 3,
      clienteId: this.idUsuarioGlobal!,
      salario: idVacante
    };

    this.matchingService.postMatching(request).subscribe({
      next: (response: any) => {
        if (response?.status) {
          Swal.fire({
            icon: response.status,
            title: response.status === 'success' ? '¡Postulación exitosa!' : 'Atención',
            text: response.message
          });
         this.obtenerMatching();
        } else if (Array.isArray(response)) {
          this.ofertas = response;
          this.ofertasOriginales = [...response];
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error desconocido',
            text: 'No se pudo procesar la postulación.'
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo contactar con el servidor.'
        });
      }
    });
  }

  /** ============================
   *  CARGA DE CATÁLOGOS
   *  ============================ */
  cargarCatalogos(): void {
    this.vacanteService.obtenerAreas().subscribe({
      next: (resp) => resp.success && (this.areas = resp.data),
      error: () => console.error('Error cargando áreas')
    });

    this.vacanteService.obtenerHabilidades().subscribe({
      next: (resp) => resp.success && (this.habilidades = resp.data),
      error: () => console.error('Error cargando habilidades')
    });

    this.vacanteService.obtenerIdiomas().subscribe({
      next: (resp) => resp.success && (this.idiomas = resp.data),
      error: () => console.error('Error cargando idiomas')
    });

    this.vacanteService.obtenerModalidades().subscribe({
      next: (resp) => resp.success && (this.modalidades = resp.data),
      error: () => console.error('Error cargando modalidades')
    });
  }

  /** ============================
   *  ANÁLISIS DE COMPETENCIA
   *  (sí se usa en el HTML)
   *  ============================ */
  getPosicionRanking(vacante: VacanteMatch): string {
    if (!vacante.match_competencia?.length) return 'N/A';

    const sorted = [...vacante.match_competencia].sort((a, b) => b - a);
    const posicion = sorted.findIndex(x => x <= vacante.porcentaje_match) + 1;
    return `${posicion}° de ${sorted.length}`;
  }

  getClasePosicion(vacante: VacanteMatch): string {
    if (!vacante.match_competencia?.length) return '';

    const sorted = [...vacante.match_competencia].sort((a, b) => b - a);
    const posicion = sorted.findIndex(x => x <= vacante.porcentaje_match) + 1;
    const porcentaje = (posicion / sorted.length) * 100;

    if (porcentaje <= 25) return 'excelente';
    if (porcentaje <= 50) return 'buena';
    if (porcentaje <= 75) return 'media';
    return 'baja';
  }

  getPromedioCompetencia(vacante: VacanteMatch): number {
    if (!vacante.match_competencia?.length) return 0;

    const suma = vacante.match_competencia.reduce((a, b) => a + b, 0);
    return Number((suma / vacante.match_competencia.length).toFixed(1));
  }

  getRecomendaciones(vacante: VacanteMatch): string {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return 'No hay suficientes datos para generar una recomendación.';
    }

    const cantidad = vacante.match_competencia.length;
    const tuMatch = vacante.porcentaje_match;
    const promedio = this.getPromedioCompetencia(vacante);
    const posicion = this.getPosicionNumerica(vacante);
    const total = cantidad;

    if (cantidad <= 2) {
      if (tuMatch >= 70) return '¡Excelente oportunidad! Pocos competidores y tu match es alto.';
      if (tuMatch >= 50) return 'Buena oportunidad. Pocos competidores.';
      return 'Competencia baja pero tu match es bajo.';
    } else if (cantidad <= 5) {
      if (posicion <= 2) return '¡Estás entre los mejores!';
      if (tuMatch > promedio) return 'Estás encima del promedio.';
      return 'Competencia media.';
    } else if (cantidad <= 10) {
      if (posicion <= 3) return '¡Destacas en el top 30%!';
      if (tuMatch >= 70) return 'Match alto, vale la pena postularse.';
      return 'Competencia considerable.';
    } else {
      if (posicion <= Math.ceil(total * 0.2)) return 'Estás en el top 20%! Excelente.';
      if (posicion <= Math.ceil(total * 0.4)) return 'Buena posición considerando la competencia.';
      if (tuMatch >= 75) return 'Match alto pese a la competencia.';
      return 'Alta competencia, evalúa tus opciones.';
    }
  }

  private getPosicionNumerica(vacante: VacanteMatch): number {
    if (!vacante.match_competencia?.length) return 0;

    const sorted = [...vacante.match_competencia].sort((a, b) => b - a);
    return sorted.findIndex(x => x <= vacante.porcentaje_match) + 1;
  }

  getNivelDificultad(vacante: VacanteMatch): { texto: string; clase: string } {
    const cantidad = vacante.match_competencia?.length || 0;
    if (cantidad === 0) return { texto: 'No determinado', clase: 'neutral' };

    const posicion = this.getPosicionNumerica(vacante);
    const porcentaje = (posicion / cantidad) * 100;

    if (cantidad <= 2) return { texto: 'Baja', clase: 'facil' };
    if (cantidad <= 5) return porcentaje <= 40 ? { texto: 'Media-Baja', clase: 'facil' } : { texto: 'Media', clase: 'media' };
    if (cantidad <= 10) return porcentaje <= 30 ? { texto: 'Media', clase: 'media' } : { texto: 'Media-Alta', clase: 'media-alta' };
    if (porcentaje <= 20) return { texto: 'Alta', clase: 'dificil' };
    if (porcentaje <= 40) return { texto: 'Alta', clase: 'media-alta' };
    return { texto: 'Muy Alta', clase: 'muy-dificil' };
  }

  /** ============================
   *  MODAL - OBSERVER
   *  ============================ */
  abrirModalCompetencia(vacante: VacanteMatch): void {
    this.vacanteCompetencia = vacante;
    this.mostrarModalCompetencia = true;

    setTimeout(() => {
      this.competenciaService.notificarCambio({
        competencia: vacante.match_competencia || [],
        estado: vacante.estado || 'ACTIVA',
        miMatch: vacante.porcentaje_match
      });
    }, 0);
  }

  cerrarModalCompetencia(): void {
    this.mostrarModalCompetencia = false;

    setTimeout(() => {
      this.vacanteCompetencia = null;
      this.competenciaService.limpiar();
    }, 100);
  }

  obtenerMatching(): void {
    this.matchingService.obtenerMatch(this.idUsuarioGlobal!)
      .subscribe({
        next: (data) => {
          console.log('MATCHING RECIBIDO:', data);
          this.ofertas = data;
        },
        error: (err) => {
          console.error('Error obteniendo matching:', err);
        }
      });
  }
}
