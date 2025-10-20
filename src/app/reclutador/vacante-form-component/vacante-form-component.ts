import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { VacanteRequest, Area, Habilidad, Idioma, Modalidad, Vacante } from '../../models/vacante-model';
import { VacanteService } from '../../service/vacante-service';

@Component({
  selector: 'app-vacante-form-modal',
  standalone: false,
  templateUrl: './vacante-form-component.html',
  styleUrl: './vacante-form-component.scss'
})
export class VacanteFormComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() vacante: Vacante | null = null;
  @Input() isEdit: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  vacanteRequest: VacanteRequest = {
    titulo: '',
    descripcion: '',
    salario: 0,
    ubicacion: '',
    tipoContrato: '',
    solicitudesPermitidas: 50,
    estado: 'ACTIVA',
    fechaExpiracion: '',
    beneficios: '',
    empresa: '',
    horaInicio: '',
    horaFin: '',
    diasLaborales: '',
    horasPorSemana: 40,
    turno: '',
    horarioFlexible: false,
    areaId: 0,
    modalidadId: 0,
    habilidadesIds: [],
    idiomasIds: []
  };

  areas: Area[] = [];
  habilidades: Habilidad[] = [];
  habilidadesFiltradas: Habilidad[] = [];
  idiomas: Idioma[] = [];
  modalidades: Modalidad[] = [];

  loading = false;
  error = '';
  success = '';
  catalogosCargados = false;

  constructor(private vacanteService: VacanteService) {
    console.log('✅ VacanteFormModalComponent - Constructor inicializado');
  }

  ngOnInit(): void {
    console.log('🔄 VacanteFormModalComponent - ngOnInit iniciado');
    this.cargarCatalogos();
  }

  ngOnChanges(): void {
    console.log('🔄 VacanteFormModalComponent - ngOnChanges detectado', {
      show: this.show,
      isEdit: this.isEdit,
      vacante: this.vacante
    });

    if (this.show && this.catalogosCargados) {
      if (this.isEdit && this.vacante) {
        console.log('✏️ VacanteFormModalComponent - Cargando datos para edición:', this.vacante.id);
        this.cargarDatosEdicion();
      } else {
        console.log('➕ VacanteFormModalComponent - Inicializando para nueva vacante');
        this.inicializarNuevaVacante();
      }
    }
  }

  cargarCatalogos(): void {
    console.log('📥 VacanteFormModalComponent - Cargando catálogos...');

    // Cargar áreas
    this.vacanteService.obtenerAreas().subscribe({
      next: (response) => {
        if (response.success) {
          this.areas = response.data;
          console.log('✅ VacanteFormModalComponent - Áreas cargadas:', this.areas.length);
          this.verificarCatalogosCargados();
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
          this.verificarCatalogosCargados();
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
          this.verificarCatalogosCargados();
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
          this.verificarCatalogosCargados();
        }
      },
      error: (error) => {
        console.error('❌ VacanteFormModalComponent - Error cargando modalidades:', error);
      }
    });
  }

  verificarCatalogosCargados(): void {
    if (this.areas.length > 0 && this.habilidades.length > 0 &&
        this.idiomas.length > 0 && this.modalidades.length > 0) {
      this.catalogosCargados = true;
      console.log('✅ VacanteFormModalComponent - Todos los catálogos cargados');

      // Si el modal está visible y es edición, cargar datos
      if (this.show && this.isEdit && this.vacante) {
        console.log('🔄 VacanteFormModalComponent - Catálogos listos, cargando datos de edición');
        this.cargarDatosEdicion();
      }
    }
  }

  cargarDatosEdicion(): void {
    console.log('📋 VacanteFormModalComponent - Cargando datos de vacante para edición');
    if (!this.vacante) {
      console.error('❌ VacanteFormModalComponent - No hay datos de vacante para editar');
      return;
    }

    console.log('📊 VacanteFormModalComponent - Datos de vacante recibidos:', {
      id: this.vacante.id,
      titulo: this.vacante.titulo,
      area: this.vacante.area,
      modalidad: this.vacante.modalidad,
      habilidades: this.vacante.habilidades,
      idiomas: this.vacante.idiomas
    });

    this.vacanteRequest = {
      titulo: this.vacante.titulo || '',
      descripcion: this.vacante.descripcion || '',
      salario: this.vacante.salario || 0,
      ubicacion: this.vacante.ubicacion || '',
      tipoContrato: this.vacante.tipoContrato || '',
      solicitudesPermitidas: this.vacante.solicitudesPermitidas || 50,
      estado: this.vacante.estado || 'ACTIVA',
      fechaExpiracion: this.formatFechaExpiracion(this.vacante.fechaExpiracion) || '',
      beneficios: this.vacante.beneficios || '',
      empresa: this.vacante.empresa || '',
      horaInicio: this.vacante.horaInicio || '',
      horaFin: this.vacante.horaFin || '',
      diasLaborales: this.vacante.diasLaborales || '',
      horasPorSemana: this.vacante.horasPorSemana || 40,
      turno: this.vacante.turno || '',
      horarioFlexible: this.vacante.horarioFlexible || false,
      areaId: this.vacante.area?.id || 0,
      modalidadId: this.vacante.modalidad?.id || 0,
      habilidadesIds: this.vacante.habilidades?.map(h => h.id) || [],
      idiomasIds: this.vacante.idiomas?.map(i => i.id) || []
    };

    console.log('✅ VacanteFormModalComponent - Datos de edición cargados:', {
      areaId: this.vacanteRequest.areaId,
      modalidadId: this.vacanteRequest.modalidadId,
      habilidadesIds: this.vacanteRequest.habilidadesIds,
      idiomasIds: this.vacanteRequest.idiomasIds
    });

    // Cargar habilidades filtradas si hay área seleccionada
    if (this.vacanteRequest.areaId) {
      console.log('🔄 VacanteFormModalComponent - Cargando habilidades para área:', this.vacanteRequest.areaId);
      this.cargarHabilidadesPorArea(this.vacanteRequest.areaId);
    } else {
      this.habilidadesFiltradas = [];
      console.log('ℹ️ VacanteFormModalComponent - No hay área seleccionada, habilidades filtradas limpiadas');
    }
  }

  formatFechaExpiracion(fecha: string): string {
    if (!fecha) return '';

    // Si la fecha ya está en formato correcto para datetime-local
    if (fecha.includes('T')) {
      return fecha.slice(0, 16); // YYYY-MM-DDTHH:MM
    }

    // Si es una fecha sin tiempo, agregar tiempo por defecto
    const fechaObj = new Date(fecha);
    if (!isNaN(fechaObj.getTime())) {
      return fechaObj.toISOString().slice(0, 16);
    }

    return fecha;
  }

  cargarHabilidadesPorArea(areaId: number): void {
    console.log('📥 VacanteFormModalComponent - Cargando habilidades para área:', areaId);
    this.vacanteService.obtenerHabilidadesPorArea(areaId).subscribe({
      next: (response) => {
        if (response.success) {
          this.habilidadesFiltradas = response.data;
          console.log('✅ VacanteFormModalComponent - Habilidades filtradas cargadas:', this.habilidadesFiltradas.length);
          console.log('🔍 VacanteFormModalComponent - Habilidades disponibles:', this.habilidadesFiltradas.map(h => h.nombre));
          console.log('🎯 VacanteFormModalComponent - Habilidades seleccionadas:', this.vacanteRequest.habilidadesIds);
        } else {
          console.error('❌ VacanteFormModalComponent - Error en respuesta de habilidades filtradas');
          this.habilidadesFiltradas = [];
        }
      },
      error: (error) => {
        console.error('❌ VacanteFormModalComponent - Error cargando habilidades filtradas:', error);
        this.habilidadesFiltradas = [];
      }
    });
  }

  inicializarNuevaVacante(): void {
    console.log('🆕 VacanteFormModalComponent - Inicializando nueva vacante');
    this.vacanteRequest = {
      titulo: '',
      descripcion: '',
      salario: 0,
      ubicacion: '',
      tipoContrato: '',
      solicitudesPermitidas: 50,
      estado: 'ACTIVA',
      fechaExpiracion: this.obtenerFechaExpiracionPorDefecto(),
      beneficios: '',
      empresa: '',
      horaInicio: '',
      horaFin: '',
      diasLaborales: '',
      horasPorSemana: 40,
      turno: '',
      horarioFlexible: false,
      areaId: 0,
      modalidadId: 0,
      habilidadesIds: [],
      idiomasIds: []
    };
    this.habilidadesFiltradas = [];
    this.error = '';
    this.success = '';
  }

  obtenerFechaExpiracionPorDefecto(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);
    return fecha.toISOString().slice(0, 16);
  }

  onAreaChange(): void {
    console.log('🔄 VacanteFormModalComponent - Cambio de área detectado:', this.vacanteRequest.areaId);
    if (this.vacanteRequest.areaId) {
      this.cargarHabilidadesPorArea(this.vacanteRequest.areaId);
    } else {
      this.habilidadesFiltradas = [];
      console.log('ℹ️ VacanteFormModalComponent - No hay área seleccionada, habilidades filtradas limpiadas');
    }
  }

  toggleHabilidad(habilidadId: number): void {
    const index = this.vacanteRequest.habilidadesIds.indexOf(habilidadId);
    if (index > -1) {
      this.vacanteRequest.habilidadesIds.splice(index, 1);
      console.log(`➖ VacanteFormModalComponent - Habilidad ${habilidadId} removida`);
    } else {
      this.vacanteRequest.habilidadesIds.push(habilidadId);
      console.log(`➕ VacanteFormModalComponent - Habilidad ${habilidadId} agregada`);
    }
    console.log('📋 VacanteFormModalComponent - Habilidades seleccionadas:', this.vacanteRequest.habilidadesIds);
  }

  toggleIdioma(idiomaId: number): void {
    const index = this.vacanteRequest.idiomasIds.indexOf(idiomaId);
    if (index > -1) {
      this.vacanteRequest.idiomasIds.splice(index, 1);
      console.log(`➖ VacanteFormModalComponent - Idioma ${idiomaId} removido`);
    } else {
      this.vacanteRequest.idiomasIds.push(idiomaId);
      console.log(`➕ VacanteFormModalComponent - Idioma ${idiomaId} agregado`);
    }
    console.log('🌐 VacanteFormModalComponent - Idiomas seleccionados:', this.vacanteRequest.idiomasIds);
  }

  onSubmit(): void {
    console.log('💾 VacanteFormModalComponent - Enviando formulario...', {
      isEdit: this.isEdit,
      datos: this.vacanteRequest
    });

    // Validar datos requeridos
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const operation = this.isEdit && this.vacante
      ? this.vacanteService.actualizarVacante(this.vacante.id!, this.vacanteRequest)
      : this.vacanteService.crearVacante(this.vacanteRequest);

    operation.subscribe({
      next: (response) => {
        console.log('✅ VacanteFormModalComponent - Respuesta del servidor:', response);
        if (response.success) {
          this.success = this.isEdit
            ? 'Vacante actualizada exitosamente'
            : 'Vacante creada exitosamente';

          console.log('🎉 VacanteFormModalComponent - Operación exitosa, emitiendo evento guardado');
          setTimeout(() => {
            this.guardado.emit();
          }, 1500);
        } else {
          this.error = response.message || 'Error al procesar la solicitud';
          console.error('❌ VacanteFormModalComponent - Error en respuesta:', this.error);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error de conexión: ' + error.message;
        this.loading = false;
        console.error('❌ VacanteFormModalComponent - Error HTTP:', error);
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.vacanteRequest.titulo.trim()) {
      this.error = 'El título del puesto es requerido';
      return false;
    }
    if (!this.vacanteRequest.empresa.trim()) {
      this.error = 'La empresa es requerida';
      return false;
    }
    if (!this.vacanteRequest.descripcion.trim()) {
      this.error = 'La descripción es requerida';
      return false;
    }
    if (!this.vacanteRequest.ubicacion.trim()) {
      this.error = 'La ubicación es requerida';
      return false;
    }
    if (!this.vacanteRequest.areaId) {
      this.error = 'El área profesional es requerida';
      return false;
    }
    if (!this.vacanteRequest.modalidadId) {
      this.error = 'La modalidad de trabajo es requerida';
      return false;
    }
    if (!this.vacanteRequest.tipoContrato.trim()) {
      this.error = 'El tipo de contrato es requerido';
      return false;
    }
    if (!this.vacanteRequest.fechaExpiracion) {
      this.error = 'La fecha de expiración es requerida';
      return false;
    }
    return true;
  }

  onClose(): void {
    console.log('❌ VacanteFormModalComponent - Cerrando modal');
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      console.log('🎯 VacanteFormModalComponent - Click en backdrop, cerrando modal');
      this.onClose();
    }
  }

  // Helper para verificar si una habilidad está seleccionada
  isHabilidadSelected(habilidadId: number): boolean {
    return this.vacanteRequest.habilidadesIds.includes(habilidadId);
  }

  // Helper para verificar si un idioma está seleccionado
  isIdiomaSelected(idiomaId: number): boolean {
    return this.vacanteRequest.idiomasIds.includes(idiomaId);
  }

  // Helper para obtener nombre del área seleccionada
  getAreaNombre(): string {
    const area = this.areas.find(a => a.id === this.vacanteRequest.areaId);
    return area ? area.nombre : 'No seleccionada';
  }

  // Helper para obtener nombre de la modalidad seleccionada
  getModalidadNombre(): string {
    const modalidad = this.modalidades.find(m => m.id === this.vacanteRequest.modalidadId);
    return modalidad ? modalidad.nombre : 'No seleccionada';
  }
}
