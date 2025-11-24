// import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
// import { Subscription } from 'rxjs';
// import {
//   BarChartStrategy,
//   ChartStrategy,
//   DisabledChartStrategy,
//   LineChartStrategy,
//   NoCompetitionStrategy
// } from '../../strategies/chart-strategies';
// import { CompetenciaObserverService, CompetenciaData } from '../../service/competencia.service';

// /**
//  * Componente que actúa como OBSERVER (Observador)
//  * Se suscribe al CompetenciaObserverService para recibir notificaciones
//  */
// @Component({
//   selector: 'app-match-chart',
//   standalone: false,
//   template: `
//     <div class="chart-container">
//       <canvas #myCanvas width="400" height="180"></canvas>
//       <div class="chart-info">
//         <p class="chart-caption">{{ caption }}</p>
//         <div class="chart-stats" *ngIf="showStats">
//           <span class="stat-item">📊 {{ cantidadPostulantes }} postulante(s)</span>
//           <span class="stat-item" *ngIf="estrategiaActual">
//             {{ estrategiaActual }}
//           </span>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .chart-container {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       background: linear-gradient(to bottom, #ffffff, #f9fafb);
//       padding: 20px;
//       border-radius: 16px;
//       border: 1px solid #e5e7eb;
//       box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
//       transition: all 0.3s ease;
//     }

//     .chart-container:hover {
//       box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
//       transform: translateY(-2px);
//     }

//     canvas {
//       max-width: 100%;
//       height: auto;
//     }

//     .chart-info {
//       width: 100%;
//       margin-top: 15px;
//       text-align: center;
//     }

//     .chart-caption {
//       margin: 0;
//       font-size: 0.95rem;
//       color: #374151;
//       font-weight: 600;
//       margin-bottom: 8px;
//     }

//     .chart-stats {
//       display: flex;
//       justify-content: center;
//       gap: 15px;
//       flex-wrap: wrap;
//     }

//     .stat-item {
//       font-size: 0.8rem;
//       color: #6b7280;
//       background: #f3f4f6;
//       padding: 4px 12px;
//       border-radius: 12px;
//       font-weight: 500;
//     }

//     @media (max-width: 768px) {
//       .chart-container {
//         padding: 15px;
//       }

//       canvas {
//         width: 100%;
//       }
//     }
//   `]
// })
// export class MatchChartComponent implements OnInit, OnDestroy {
//   // --- PATRÓN OBSERVER ---
//   // Esta suscripción conecta este componente como OBSERVER
//   private subscription!: Subscription;

//   @ViewChild('myCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

//   // Datos locales
//   private competencia: number[] = [];
//   private estado: string = 'ACTIVA';
//   private miMatch?: number;

//   // Variables de visualización
//   private strategy!: ChartStrategy;
//   public caption: string = 'Esperando datos...';
//   public estrategiaActual: string = '';
//   public showStats: boolean = false;
//   public cantidadPostulantes: number = 0;

//   constructor(private competenciaService: CompetenciaObserverService) {
//     console.log('👀 MatchChartComponent: OBSERVER creado');
//   }

//   /**
//    * OnInit: Aquí nos SUSCRIBIMOS al Observable (nos registramos como observer)
//    * Esto es equivalente a: subject.attach(observer)
//    */
//   ngOnInit(): void {
//     console.log('🔗 MatchChartComponent: Suscribiéndose al Subject...');

//     // PATRÓN OBSERVER: El componente se suscribe para recibir notificaciones
//     this.subscription = this.competenciaService.competencia$.subscribe({
//       next: (data: CompetenciaData | null) => {
//         console.log('📬 MatchChartComponent: Notificación recibida', data);
//         this.update(data); // Método update típico del patrón Observer
//       },
//       error: (error) => {
//         console.error('❌ MatchChartComponent: Error en la suscripción', error);
//       }
//     });
//   }

//   /**
//    * Método UPDATE del patrón Observer
//    * Se ejecuta cada vez que el Subject notifica un cambio
//    */
//   private update(data: CompetenciaData | null): void {
//     console.log('🔄 MatchChartComponent: Ejecutando UPDATE con nuevos datos');

//     if (!data) {
//       this.limpiarGrafica();
//       return;
//     }

//     // Actualizar datos locales
//     this.competencia = data.competencia || [];
//     this.estado = data.estado || 'ACTIVA';
//     this.miMatch = data.miMatch;
//     this.cantidadPostulantes = this.competencia.length;

//     // Re-renderizar la gráfica con los nuevos datos
//     this.renderChart();
//   }

//   /**
//    * Renderiza la gráfica usando el patrón Strategy
//    */
//   private renderChart(): void {
//     const canvas = this.canvasRef.nativeElement;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     console.log('🎨 MatchChartComponent: Renderizando gráfica con Strategy pattern');

//     // Seleccionar estrategia
//     this.selectStrategy();

//     // Ejecutar la estrategia elegida
//     this.strategy.draw(ctx, canvas.width, canvas.height, this.competencia, this.miMatch);
//   }

//   /**
//    * Patrón Strategy: Selecciona la estrategia apropiada
//    */
//   private selectStrategy(): void {
//     // 1. Si la vacante está cerrada o pausada
//     if (this.estado === 'CERRADA' || this.estado === 'PAUSADA') {
//       this.strategy = new DisabledChartStrategy();
//       this.caption = 'Convocatoria cerrada';
//       this.estrategiaActual = '🔒 No disponible';
//       this.showStats = false;
//       return;
//     }

//     // 2. Si no hay competencia (0 postulantes)
//     if (!this.competencia || this.competencia.length === 0) {
//       this.strategy = new NoCompetitionStrategy();
//       this.caption = '¡Excelente oportunidad!';
//       this.estrategiaActual = '✨ Sin competencia';
//       this.showStats = false;
//       return;
//     }

//     const totalPostulantes = this.competencia.length;

//     // 3. De 1 a 3 postulantes -> Gráfica de Barras
//     if (totalPostulantes >= 1 && totalPostulantes <= 3) {
//       this.strategy = new BarChartStrategy();
//       this.caption = 'Comparativa detallada';
//       this.estrategiaActual = '📊 Vista de barras';
//       this.showStats = true;
//     }
//     // 4. De 4 o más postulantes -> Gráfica de Línea
//     else if (totalPostulantes >= 4) {
//       this.strategy = new LineChartStrategy();
//       this.caption = totalPostulantes >= 10
//         ? 'Alta competencia - Distribución de postulantes'
//         : 'Tendencia de competidores';
//       this.estrategiaActual = '📈 Vista de tendencia';
//       this.showStats = true;
//     }
//   }

//   /**
//    * Limpia la gráfica cuando no hay datos
//    */
//   private limpiarGrafica(): void {
//     const canvas = this.canvasRef.nativeElement;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Mostrar mensaje de "Esperando datos"
//     ctx.fillStyle = '#6b7280';
//     ctx.font = '14px Arial';
//     ctx.textAlign = 'center';
//     ctx.fillText('Esperando datos...', canvas.width / 2, canvas.height / 2);

//     this.caption = 'Sin datos de competencia';
//     this.estrategiaActual = '';
//     this.showStats = false;
//     this.cantidadPostulantes = 0;
//   }

//   /**
//    * OnDestroy: IMPORTANTE - Desuscribirse para evitar memory leaks
//    * Esto es equivalente a: subject.detach(observer)
//    */
//   ngOnDestroy(): void {
//     console.log('🔌 MatchChartComponent: Desuscribiéndose del Subject');
//     if (this.subscription) {
//       this.subscription.unsubscribe();
//     }
//   }
// }
