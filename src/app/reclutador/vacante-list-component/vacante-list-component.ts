import { Component, OnInit } from '@angular/core';
import { Vacante } from '../../models/vacante-model';
import { VacanteService } from '../../service/vacante-service';
import { Router } from '@angular/router';

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

  constructor(
    private vacanteService: VacanteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarVacantes();
  }

  cargarVacantes(): void {
    this.loading = true;
    this.vacanteService.obtenerVacantes().subscribe({
      next: (response) => {
        if (response.success) {
          this.vacantes = response.data;
        } else {
          this.error = response.message || 'Error al cargar vacantes';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error de conexión: ' + error.message;
        this.loading = false;
      }
    });
  }

  nuevaVacante(): void {
    this.router.navigate(['/reclutador/vacantes/nueva']);
  }

  editarVacante(id: number): void {
    this.router.navigate(['/vacantes/editar', id]);
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
      }
    });
  }

  eliminarVacante(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta vacante?')) {
      this.vacanteService.eliminarVacante(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.vacantes = this.vacantes.filter(v => v.id !== id);
          } else {
            this.error = response.message || 'Error al eliminar vacante';
          }
        },
        error: (error) => {
          this.error = 'Error de conexión: ' + error.message;
        }
      });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA':
        return 'badge bg-success';
      case 'INACTIVA':
        return 'badge bg-secondary';
      case 'CANCELADA':
        return 'badge bg-danger';
      case 'CERRADA':
        return 'badge bg-warning';
      default:
        return 'badge bg-info';
    }
  }
}
