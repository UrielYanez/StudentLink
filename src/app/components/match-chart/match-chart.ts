import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CompetenciaData, CompetenciaObserver } from '../../interfaces/observer.interface';
import { BarChartStrategy, ChartStrategy, DisabledChartStrategy, LineChartStrategy, NoCompetitionStrategy } from '../../interfaces/strategy.interface';
import { CompetenciaObserverService } from '../../service/competencia.service';


@Component({
  selector: 'app-match-chart',
  standalone: false,
  templateUrl: './match-chart.html',
  styleUrl: './match-chart.scss'
})
export class MatchChartComponent implements OnInit, OnDestroy, CompetenciaObserver {

  @ViewChild('myCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // --- Datos internos ---
  private competencia: number[] = [];
  private estado: string = 'ACTIVA';
  private miMatch?: number;

  // --- Strategy Pattern ---
  private strategy!: ChartStrategy;
  public caption: string = 'Esperando datos...';
  public estrategiaActual: string = '';
  public showStats: boolean = false;
  public cantidadPostulantes: number = 0;

  constructor(private competenciaService: CompetenciaObserverService) {}

  // =============================================================
  // PATRÓN OBSERVER - Implementación manual
  // =============================================================

  /**
   * Método requerido por la interfaz CompetenciaObserver
   * Se ejecuta automáticamente cuando el Subject notifica cambios
   */
  update(data: CompetenciaData | null): void {
    console.log('MatchChartComponent: Recibida actualización vía Observer Pattern');

    if (!data) {
      this.limpiarGrafica();
      return;
    }

    this.competencia = data.competencia || [];
    this.estado = data.estado || 'ACTIVA';
    this.miMatch = data.miMatch;
    this.cantidadPostulantes = this.competencia.length;

    this.renderChart();
  }

  ngOnInit(): void {
    // Registrarse como observer en el Subject
    this.competenciaService.subscribe(this);
    console.log('MatchChartComponent: Registrado como Observer');
  }

  ngOnDestroy(): void {
    // Desregistrarse como observer para evitar memory leaks
    this.competenciaService.unsubscribe(this);
    console.log('MatchChartComponent: Desregistrado como Observer');
  }

  // =============================================================
  // PATRÓN STRATEGY (sin cambios)
  // =============================================================

  private renderChart(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.selectStrategy();
    this.strategy.draw(ctx, canvas.width, canvas.height, this.competencia, this.miMatch);
  }

  private selectStrategy(): void {
    if (this.estado === 'CERRADA' || this.estado === 'PAUSADA') {
      this.strategy = new DisabledChartStrategy();
      this.caption = 'Convocatoria cerrada';
      this.estrategiaActual = '🔒 No disponible';
      this.showStats = false;
      return;
    }

    if (!this.competencia || this.competencia.length === 0) {
      this.strategy = new NoCompetitionStrategy();
      this.caption = '¡Excelente oportunidad!';
      this.estrategiaActual = '✨ Sin competencia';
      this.showStats = false;
      return;
    }

    const totalPostulantes = this.competencia.length;

    if (totalPostulantes >= 1 && totalPostulantes <= 3) {
      this.strategy = new BarChartStrategy();
      this.caption = 'Comparativa detallada';
      this.estrategiaActual = '📊 Vista de barras';
      this.showStats = true;
    } else {
      this.strategy = new LineChartStrategy();
      this.caption = totalPostulantes >= 10
        ? 'Alta competencia - Distribución de postulantes'
        : 'Tendencia de competidores';
      this.estrategiaActual = '📈 Vista de tendencia';
      this.showStats = true;
    }
  }

  private limpiarGrafica(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Esperando datos...', canvas.width / 2, canvas.height / 2);

    this.caption = 'Sin datos de competencia';
    this.estrategiaActual = '';
    this.showStats = false;
    this.cantidadPostulantes = 0;
  }
}
