import { Component, OnInit } from '@angular/core';
import { MatchingRequest, VacanteMatch } from '../../models/maching';
import { Maching } from '../../service/maching';
import { UsuarioContextService } from '../../auth/Service/usuario-context-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class homeMaching implements OnInit {
  // Datos base
  tipo: number = 1;


  // Listas de vacantes
  ofertas: VacanteMatch[] = [];
  ofertasOriginales: VacanteMatch[] = []; // Backup de datos originales
  selectedVacante: VacanteMatch | null = null;


  // Variables para el modal de datos de usuario global
  nombreUsuarioGlobal: string | null = null;
  idUsuarioGlobal: number | null = null;

  // Opciones para los selects
  modalidades: string[] = ['Presencial', 'Remoto', 'Híbrido'];
  areas: string[] = ['Sistemas', 'Recursos Humanos', 'Ventas', 'Marketing', 'Finanzas', 'Operaciones'];
  turnos: string[] = ['Matutino', 'Vespertino', 'Nocturno', 'Mixto'];

  // Estado de filtros
  mostrarFiltros: boolean = false;
  aplicandoFiltros: boolean = false;

  constructor(private matchingService: Maching, private usuarioContextService: UsuarioContextService,) { }

  ngOnInit() {
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
  selectVacante(vacante: VacanteMatch) {
    this.selectedVacante = vacante;
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

}