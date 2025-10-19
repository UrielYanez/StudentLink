import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VacanteRequest, Area, Habilidad, Idioma, Modalidad } from '../../models/vacante-model';
import { VacanteService } from '../../service/vacante-service';

@Component({
  selector: 'app-vacante-form-component',
  standalone: false,
  templateUrl: './vacante-form-component.html',
  styleUrl: './vacante-form-component.scss'
})
export class VacanteFormComponent implements OnInit {
  vacante: VacanteRequest = {
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
  isEdit = false;
  error = '';
  success = '';

  constructor(
    private vacanteService: VacanteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.cargarVacante(Number(id));
    } else {
      // Establecer fecha de expiración por defecto (30 días desde hoy)
      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);
      this.vacante.fechaExpiracion = fechaExpiracion.toISOString().slice(0, 16);
    }
  }

  cargarCatalogos(): void {
    this.vacanteService.obtenerAreas().subscribe({
      next: (response) => {
        if (response.success) this.areas = response.data;
      }
    });

    this.vacanteService.obtenerHabilidades().subscribe({
      next: (response) => {
        if (response.success) this.habilidades = response.data;
      }
    });

    this.vacanteService.obtenerIdiomas().subscribe({
      next: (response) => {
        if (response.success) this.idiomas = response.data;
      }
    });

    this.vacanteService.obtenerModalidades().subscribe({
      next: (response) => {
        if (response.success) this.modalidades = response.data;
      }
    });
  }

  cargarVacante(id: number): void {
    this.loading = true;
    this.vacanteService.obtenerVacantePorId(id).subscribe({
      next: (response) => {
        if (response.success) {
          const vacanteData = response.data;
          this.vacante = {
            titulo: vacanteData.titulo,
            descripcion: vacanteData.descripcion,
            salario: vacanteData.salario,
            ubicacion: vacanteData.ubicacion,
            tipoContrato: vacanteData.tipoContrato,
            solicitudesPermitidas: vacanteData.solicitudesPermitidas,
            estado: vacanteData.estado,
            fechaExpiracion: vacanteData.fechaExpiracion,
            beneficios: vacanteData.beneficios || '',
            empresa: vacanteData.empresa,
            horaInicio: vacanteData.horaInicio || '',
            horaFin: vacanteData.horaFin || '',
            diasLaborales: vacanteData.diasLaborales || '',
            horasPorSemana: vacanteData.horasPorSemana || 40,
            turno: vacanteData.turno || '',
            horarioFlexible: vacanteData.horarioFlexible,
            areaId: vacanteData.area?.id || 0,
            modalidadId: vacanteData.modalidad?.id || 0,
            habilidadesIds: vacanteData.habilidades?.map(h => h.id) || [],
            idiomasIds: vacanteData.idiomas?.map(i => i.id) || []
          };
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar vacante: ' + error.message;
        this.loading = false;
      }
    });
  }

  onAreaChange(): void {
    if (this.vacante.areaId) {
      this.vacanteService.obtenerHabilidadesPorArea(this.vacante.areaId).subscribe({
        next: (response) => {
          if (response.success) {
            this.habilidadesFiltradas = response.data;
          }
        }
      });
    } else {
      this.habilidadesFiltradas = [];
    }
  }

  toggleHabilidad(habilidadId: number): void {
    const index = this.vacante.habilidadesIds.indexOf(habilidadId);
    if (index > -1) {
      this.vacante.habilidadesIds.splice(index, 1);
    } else {
      this.vacante.habilidadesIds.push(habilidadId);
    }
  }

  toggleIdioma(idiomaId: number): void {
    const index = this.vacante.idiomasIds.indexOf(idiomaId);
    if (index > -1) {
      this.vacante.idiomasIds.splice(index, 1);
    } else {
      this.vacante.idiomasIds.push(idiomaId);
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const operation = this.isEdit
      ? this.vacanteService.actualizarVacante(Number(this.route.snapshot.paramMap.get('id')), this.vacante)
      : this.vacanteService.crearVacante(this.vacante);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.success = this.isEdit
            ? 'Vacante actualizada exitosamente'
            : 'Vacante creada exitosamente';

          setTimeout(() => {
            this.router.navigate(['/vacantes']);
          }, 2000);
        } else {
          this.error = response.message || 'Error al procesar la solicitud';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error de conexión: ' + error.message;
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/vacantes']);
  }
}
