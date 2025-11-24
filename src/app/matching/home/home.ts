import { Component, OnInit } from '@angular/core';
import { MatchingRequest, VacanteMatch } from '../../models/maching';
import { Maching } from '../../service/maching';
import { UsuarioContextService } from '../../auth/Service/usuario-context-service';
import Swal from 'sweetalert2';
import { VacanteService } from '../../service/vacante-service';
import { Area,Habilidad,Idioma,Modalidad } from '../../models/vacante-model';
import { CompetenciaObserverService } from '../../service/competencia.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class homeMaching implements OnInit {
  // Datos base
  tipo: number = 1;

  // Variables para el modal de competencia
  mostrarModalCompetencia: boolean = false;
  vacanteCompetencia: VacanteMatch | null = null;


  // Listas de vacantes
  ofertas: VacanteMatch[] = [];
  ofertasOriginales: VacanteMatch[] = []; // Backup de datos originales
  selectedVacante: VacanteMatch | null = null;


  // Variables para el modal de datos de usuario global
  nombreUsuarioGlobal: string | null = null;
  idUsuarioGlobal: number | null = null;
  emailll: string | null = null;
  // Opciones para los selects
  turnos: string[] = ['Matutino', 'Vespertino', 'Nocturno', 'Mixto','Flexible'];

    areas: Area[] = [];
    habilidades: Habilidad[] = [];
    habilidadesFiltradas: Habilidad[] = [];
    idiomas: Idioma[] = [];
    modalidades: Modalidad[] = [];

  // Estado de filtros
  mostrarFiltros: boolean = false;
  aplicandoFiltros: boolean = false;

  constructor(private matchingService: Maching, private usuarioContextService: UsuarioContextService,private vacanteService: VacanteService, private competenciaService: CompetenciaObserverService) {
  console.log('🏠 HomeComponent: Constructor inicializado');
}

  ngOnInit() {
    this.cargarCatalogos();

    // Suscribirse a los cambios del usuario
    this.usuarioContextService.usuarioCambio$.subscribe((userData) => {
      if (userData) {
        this.nombreUsuarioGlobal = userData.name;
        this.idUsuarioGlobal = userData.id ?? null;

        console.log('Usuario cargado:', userData);
        this.cargarVacantesIniciales(); // 👈 Ya tienes el ID aquí
      }
    });

    // Si ya hay datos cargados desde localStorage, también úsalos
    const userData = this.usuarioContextService.getUserData();
    if (userData) {
      this.nombreUsuarioGlobal = userData.name;
      this.emailll = userData.email;
      console.log(this.emailll)
      this.idUsuarioGlobal = userData.id ?? null;
      this.cargarVacantesIniciales(); // 👈 se ejecuta si ya había datos guardados
    }
  }

  // Filtros
  filtros: MatchingRequest = {
    tipo: this.tipo,
    clienteId: this.idUsuarioGlobal!
  };
  /**
   * Carga inicial de vacantes sin filtros
   */
  cargarVacantesIniciales() {
    const request: MatchingRequest = {
      tipo: this.tipo,
      clienteId: this.idUsuarioGlobal!
    };

    this.matchingService.postMatching(request).subscribe({
      next: (data) => {
        this.ofertas = data;
        this.ofertasOriginales = [...data]; // Guardar copia
        if (this.ofertas.length > 0) {
          this.selectedVacante = this.ofertas[0];
        }
      },
      error: (err) => {
        console.error('Error al cargar vacantes:', err);
      }
    });
  }
  get cantidadOfertas(): number {
    return this.ofertas.length;
  }
  /**
   * Aplica los filtros seleccionados
   */
  aplicarFiltros() {
    this.aplicandoFiltros = true;

    // Construir request solo con filtros que tengan valor
    const request: MatchingRequest = {
      tipo: 4,
      clienteId: this.idUsuarioGlobal!
    };

    if (this.filtros.salario && this.filtros.salario > 0) {
      request.salario = this.filtros.salario;
    }
    if (this.filtros.modalidad) {
      request.modalidad = this.filtros.modalidad;
    }
    if (this.filtros.area) {
      request.area = this.filtros.area;
    }
    if (this.filtros.titulo) {
      request.titulo = this.filtros.titulo;
    }
    if (this.filtros.horario) {
      request.horario = this.filtros.horario;
    }

    this.matchingService.postMatching(request).subscribe({
      next: (data) => {
        this.ofertas = data;
        if (this.ofertas.length > 0) {
          this.selectedVacante = this.ofertas[0];
        } else {
          this.selectedVacante = null;
        }
        this.aplicandoFiltros = false;
      },
      error: (err) => {
        console.error('Error al aplicar filtros:', err);
        this.aplicandoFiltros = false;
      }
    });
  }

  /**
   * Limpia todos los filtros y restaura vacantes originales
   */
  limpiarFiltros() {
    this.filtros = {
      tipo: this.tipo,
      clienteId: this.idUsuarioGlobal!
    };
    this.cargarVacantesIniciales();
  }

  /**
   * Toggle para mostrar/ocultar panel de filtros
   */
  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Selecciona una vacante para ver su detalle
   */
  // selectVacante(vacante: VacanteMatch) {
  //   this.selectedVacante = vacante;
  // }

  // En tu componente homeMaching, modifica el método selectVacante:
selectVacante(vacante: VacanteMatch) {
  this.selectedVacante = vacante;
  console.log('Vacante seleccionada:', vacante);
  console.log('match_competencia:', vacante.match_competencia);
  console.log('Tipo de match_competencia:', typeof vacante.match_competencia);
}

// En tu componente
tieneDatosCompetencia(): boolean {
  return this.selectedVacante?.match_competencia != null &&
        Array.isArray(this.selectedVacante.match_competencia) &&
        this.selectedVacante.match_competencia.length > 0;
}

  /**
   * Verifica si hay filtros activos
   */
  hayFiltrosActivos(): boolean {
    return !!(
      this.filtros.salario ||
      this.filtros.modalidad ||
      this.filtros.area ||
      this.filtros.titulo ||
      this.filtros.horario
    );
  }

  Postularse(idVacante: number): void {
    const request: MatchingRequest = {
      tipo: 3,
      clienteId: this.idUsuarioGlobal!,
      salario: idVacante
    };

    this.matchingService.postMatching(request).subscribe({
      next: (response: any) => {
        // Si el backend devuelve un objeto con 'status'
        if (response && response.status) {
          if (response.status === 'success') {
            Swal.fire({
              icon: 'success',
              title: '¡Postulación exitosa!',
              text: response.message,
              confirmButtonColor: '#2563eb'
            });

          } else if (response.status === 'warning') {
            Swal.fire({
              icon: 'warning',
              title: 'Atención',
              text: response.message,
              confirmButtonColor: '#f59e0b'
            });

          }
          this.cargarVacantesIniciales();
        }
        // Si devuelve un array (por error o cambio de tipo)
        else if (Array.isArray(response)) {
          this.ofertas = response;
          this.ofertasOriginales = [...response];
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Error desconocido',
            text: 'No se pudo procesar la postulación correctamente.',
            confirmButtonColor: '#dc2626'
          });
        }
      },
      error: (err) => {
        console.error('Error al guardar postulación', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo contactar con el servidor. Intenta más tarde.',
          confirmButtonColor: '#dc2626'
        });
      }
    });
  }


  cargarCatalogos(): void {
    console.log('📥 VacanteFormModalComponent - Cargando catálogos...');

    // Cargar áreas
    this.vacanteService.obtenerAreas().subscribe({
      next: (response) => {
        if (response.success) {
          this.areas = response.data;
          console.log('✅ VacanteFormModalComponent - Áreas cargadas:', this.areas.length);

        }
      },
      error: (error) => {
        console.error('❌ VacanteFormModalComponent - Error cargando áreas:', error);
      }
    });

    // Cargar habilidades
    this.vacanteService.obtenerHabilidades().subscribe({
      next: (response) => {
        if (response.success) {
          this.habilidades = response.data;
          console.log('✅ VacanteFormModalComponent - Habilidades cargadas:', this.habilidades.length);

        }
      },
      error: (error) => {
        console.error('❌ VacanteFormModalComponent - Error cargando habilidades:', error);
      }
    });

    // Cargar idiomas
    this.vacanteService.obtenerIdiomas().subscribe({
      next: (response) => {
        if (response.success) {
          this.idiomas = response.data;
          console.log('✅ VacanteFormModalComponent - Idiomas cargados:', this.idiomas.length);

        }
      },
      error: (error) => {
        console.error('❌ VacanteFormModalComponent - Error cargando idiomas:', error);
      }
    });

    // Cargar modalidades
    this.vacanteService.obtenerModalidades().subscribe({
      next: (response) => {
        if (response.success) {
          this.modalidades = response.data;
          console.log('✅ VacanteFormModalComponent - Modalidades cargadas:', this.modalidades.length);

        }
      },
      error: (error) => {
        console.error('❌ VacanteFormModalComponent - Error cargando modalidades:', error);
      }
    });
  }

  /**
   * Abre el modal de análisis de competencia
   */
  // abrirModalCompetencia(vacante: VacanteMatch): void {
  //   // Asegurar que tenemos datos para la gráfica
  //   if (!vacante.match_competencia) {
  //     vacante.match_competencia = this.generarDatosCompetencia(vacante.porcentaje_match);
  //   }
  //   this.vacanteCompetencia = vacante;
  //   this.mostrarModalCompetencia = true;
  // }

  /**
   * Cierra el modal de competencia
   */
  // cerrarModalCompetencia(): void {
  //   this.mostrarModalCompetencia = false;
  //   this.vacanteCompetencia = null;
  // }

  /**
   * Genera datos de competencia de ejemplo
   */
  private generarDatosCompetencia(miMatch: number): number[] {
    const datos = [];
    const cantidadCompetidores = Math.floor(Math.random() * 15) + 5; // 5-20 competidores

    for (let i = 0; i < cantidadCompetidores; i++) {
      let porcentaje = miMatch + (Math.random() * 40 - 20); // ±20 puntos
      porcentaje = Math.max(0, Math.min(100, Math.round(porcentaje)));
      datos.push(porcentaje);
    }

    return datos.sort((a, b) => b - a);
  }

  /**
   * Obtiene el texto descriptivo según el nivel de competencia
   */
  getTextoCompetencia(vacante: VacanteMatch): string {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return 'No hay datos de competencia disponibles';
    }

    const cantidad = vacante.match_competencia.length;

    if (cantidad <= 3) {
      return `Competencia baja: ${cantidad} postulantes`;
    } else if (cantidad <= 10) {
      return `Competencia media: ${cantidad} postulantes`;
    } else {
      return `Alta competencia: ${cantidad} postulantes`;
    }
  }

  /**
   * Obtiene la posición en el ranking
   */
  getPosicionRanking(vacante: VacanteMatch): string {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return 'N/A';
    }

    const sorted = [...vacante.match_competencia].sort((a, b) => b - a);
    const posicion = sorted.findIndex(match => match <= vacante.porcentaje_match) + 1;
    const total = sorted.length;

    return `${posicion}° de ${total}`;
  }

  /**
   * Obtiene la clase CSS para la posición
   */
  getClasePosicion(vacante: VacanteMatch): string {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return '';
    }

    const sorted = [...vacante.match_competencia].sort((a, b) => b - a);
    const posicion = sorted.findIndex(match => match <= vacante.porcentaje_match) + 1;
    const total = sorted.length;
    const porcentajePosicion = (posicion / total) * 100;

    if (porcentajePosicion <= 25) return 'excelente';
    if (porcentajePosicion <= 50) return 'buena';
    if (porcentajePosicion <= 75) return 'media';
    return 'baja';
  }

  /**
   * Calcula el promedio de match de los competidores
   */
  getPromedioCompetencia(vacante: VacanteMatch): number {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return 0;
    }
    const suma = vacante.match_competencia.reduce((a, b) => a + b, 0);
    return Number((suma / vacante.match_competencia.length).toFixed(1));
  }

  /**
   * Obtiene el match más alto de los competidores
   */
  getMatchMasAlto(vacante: VacanteMatch): number {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return 0;
    }
    return Math.max(...vacante.match_competencia);
  }


  /**
   * Obtiene recomendaciones basadas en la competencia
   */
  getRecomendaciones(vacante: VacanteMatch): string {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return 'No hay suficientes datos para generar una recomendación.';
    }

    const cantidadCompetidores = vacante.match_competencia.length;
    const tuMatch = vacante.porcentaje_match;
    const promedio = this.getPromedioCompetencia(vacante);
    const posicion = this.getPosicionNumerica(vacante);
    const total = cantidadCompetidores;

    // Lógica de recomendaciones
    if (cantidadCompetidores <= 2) {
      if (tuMatch >= 70) {
        return '¡Excelente oportunidad! Pocos competidores y tu match es alto. Postúlate ahora.';
      } else if (tuMatch >= 50) {
        return 'Buena oportunidad. Pocos competidores, tienes buenas posibilidades.';
      } else {
        return 'Competencia baja pero tu match es bajo. Considera mejorar tu perfil.';
      }
    } else if (cantidadCompetidores <= 5) {
      if (posicion <= 2) {
        return '¡Estás entre los mejores! Competencia media pero destacas. Postúlate.';
      } else if (tuMatch > promedio) {
        return 'Vas por encima del promedio. Buena oportunidad para postularte.';
      } else {
        return 'Competencia media. Considera si esta vacante se alinea con tus objetivos.';
      }
    } else if (cantidadCompetidores <= 10) {
      if (posicion <= 3) {
        return '¡Destacas entre la competencia! Estás en el top 30%. Postúlate.';
      } else if (tuMatch >= 70) {
        return 'Tu match es alto aunque hay competencia. Vale la pena intentarlo.';
      } else {
        return 'Competencia considerable. Evalúa si esta vacante es prioritaria para ti.';
      }
    } else {
      // Más de 10 competidores
      if (posicion <= Math.ceil(total * 0.2)) { // Top 20%
        return '¡Impresionante! Estás en el top 20% a pesar de la alta competencia. Postúlate.';
      } else if (posicion <= Math.ceil(total * 0.4)) { // Top 40%
        return 'Buena posición considerando la alta competencia. Postúlate con confianza.';
      } else if (tuMatch >= 75) {
        return 'Tu match es muy alto. Aunque hay competencia, tienes posibilidades.';
      } else {
        return 'Alta competencia. Considera postularte a vacantes con menos postulantes.';
      }
    }
  }

  /**
   * Obtiene la posición numérica en el ranking
   */
  private getPosicionNumerica(vacante: VacanteMatch): number {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return 0;
    }

    const sorted = [...vacante.match_competencia].sort((a, b) => b - a);
    return sorted.findIndex(match => match <= vacante.porcentaje_match) + 1;
  }

  /**
   * Obtiene el nivel de dificultad basado en la competencia
   */
  getNivelDificultad(vacante: VacanteMatch): { texto: string, clase: string } {
    if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
      return { texto: 'No determinado', clase: 'neutral' };
    }

    const cantidad = vacante.match_competencia.length;
    const tuPosicion = this.getPosicionNumerica(vacante);
    const porcentajePosicion = (tuPosicion / cantidad) * 100;

    if (cantidad <= 2) {
      return { texto: 'Baja', clase: 'facil' };
    } else if (cantidad <= 5) {
      if (porcentajePosicion <= 40) return { texto: 'Media-Baja', clase: 'facil' };
      else return { texto: 'Media', clase: 'media' };
    } else if (cantidad <= 10) {
      if (porcentajePosicion <= 30) return { texto: 'Media', clase: 'media' };
      else return { texto: 'Media-Alta', clase: 'media-alta' };
    } else {
      if (porcentajePosicion <= 20) return { texto: 'Alta', clase: 'dificil' };
      else if (porcentajePosicion <= 40) return { texto: 'Alta', clase: 'media-alta' };
      else return { texto: 'Muy Alta', clase: 'muy-dificil' };
    }
  }

  // Reemplaza tu método abrirModalCompetencia con este:
/**
 * ============================================
 * PATRÓN OBSERVER: Método que NOTIFICA cambios
 * ============================================
 */
abrirModalCompetencia(vacante: VacanteMatch): void {
  console.log('🚀 HomeComponent: Abriendo modal y NOTIFICANDO a observers');
  console.log('📊 Datos de competencia:', vacante.match_competencia);

  // Asegurar que tenemos datos para la gráfica
  if (!vacante.match_competencia || vacante.match_competencia.length === 0) {
    console.log('⚠️ No hay match_competencia, generando datos de ejemplo');
    vacante.match_competencia = this.generarDatosCompetencia(vacante.porcentaje_match);
  }

  this.vacanteCompetencia = vacante;
  this.mostrarModalCompetencia = true;

  // ✨ PATRÓN OBSERVER: NOTIFY
  // Notificamos al Subject con los nuevos datos
  // IMPORTANTE: Usar setTimeout para asegurar que el componente ya está montado
  setTimeout(() => {
    this.competenciaService.notificarCambio({
      competencia: vacante.match_competencia || [],
      estado: vacante.estado || 'ACTIVA',
      miMatch: vacante.porcentaje_match
    });
  }, 0);
}

/**
 * Cierra el modal y limpia los datos del observer
 */
cerrarModalCompetencia(): void {
  console.log('❌ HomeComponent: Cerrando modal y limpiando observers');

  this.mostrarModalCompetencia = false;

  // Limpiamos los datos del observer con un pequeño delay
  setTimeout(() => {
    this.vacanteCompetencia = null;
    this.competenciaService.limpiar();
  }, 100);
}
}
