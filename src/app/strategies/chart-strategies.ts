// 1. La Interfaz Común (Strategy)
export interface ChartStrategy {
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], miMatch?: number): void;
}

// 2. Estrategia Concreta: Gráfica de Barras (1-3 postulantes)
export class BarChartStrategy implements ChartStrategy {
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], miMatch?: number): void {
    this.clear(ctx, width, height);

    if (!data || data.length === 0) return;

    const padding = 20;
    const barWidth = Math.min(80, (width - (padding * 2)) / data.length);
    const spacing = (width - (padding * 2) - (barWidth * data.length)) / Math.max(1, data.length - 1);
    const maxVal = 100;

    data.forEach((val, i) => {
      const barHeight = (val / maxVal) * (height - 40);
      const x = padding + (i * (barWidth + spacing));
      const y = height - barHeight - 20;

      // Destacar si es el match del usuario
      const isUserMatch = miMatch !== undefined && Math.abs(val - miMatch) < 0.1;

      // Color dinámico con gradiente
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      if (isUserMatch) {
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#d97706');
        ctx.fillStyle = gradient;
      } else if (val >= 70) {
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
        ctx.fillStyle = gradient;
      } else if (val >= 40) {
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#2563eb');
        ctx.fillStyle = gradient;
      } else {
        gradient.addColorStop(0, '#9ca3af');
        gradient.addColorStop(1, '#6b7280');
        ctx.fillStyle = gradient;
      }

      // Dibujar barra con bordes redondeados
      this.roundRect(ctx, x, y, barWidth, barHeight, 4);

      // Porcentaje encima
      ctx.fillStyle = isUserMatch ? '#f59e0b' : '#1f2937';
      ctx.font = isUserMatch ? 'bold 12px Arial' : 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${val}%`, x + (barWidth / 2), y - 5);

      // Indicador "TÚ" para el usuario
      if (isUserMatch) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px Arial';
        ctx.fillText('TÚ', x + (barWidth / 2), height - 5);
      }
    });

    // Línea base
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - 20);
    ctx.lineTo(width - padding, height - 20);
    ctx.stroke();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  private clear(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h);
  }
}

// 3. Estrategia Concreta: Gráfica de Línea (4+ postulantes)
export class LineChartStrategy implements ChartStrategy {
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], miMatch?: number): void {
    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) return;

    const padding = 30;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Ordenar datos para distribución
    const sortedData = [...data].sort((a, b) => b - a);
    const stepX = chartWidth / Math.max(1, sortedData.length - 1);

    // Área de fondo con gradiente
    const gradient = ctx.createLinearGradient(padding, padding, padding, height - padding);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');

    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    sortedData.forEach((val, i) => {
      const x = padding + (i * stepX);
      const y = padding + (chartHeight - ((val / 100) * chartHeight));
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Línea principal
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#6366f1';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    sortedData.forEach((val, i) => {
      const x = padding + (i * stepX);
      const y = padding + (chartHeight - ((val / 100) * chartHeight));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Puntos en la línea
    sortedData.forEach((val, i) => {
      const x = padding + (i * stepX);
      const y = padding + (chartHeight - ((val / 100) * chartHeight));

      const isUserMatch = miMatch !== undefined && Math.abs(val - miMatch) < 0.1;

      ctx.beginPath();
      ctx.arc(x, y, isUserMatch ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isUserMatch ? '#f59e0b' : '#6366f1';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etiqueta para el usuario
      if (isUserMatch) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TÚ', x, y - 12);
        ctx.fillText(`${val}%`, x, y + 18);
      }
    });

    // Ejes y etiquetas
    this.drawAxes(ctx, width, height, padding);
  }

  private drawAxes(ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Eje Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Eje X
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Etiquetas Y
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    [0, 25, 50, 75, 100].forEach(val => {
      const y = (height - padding) - ((val / 100) * (height - (padding * 2)));
      ctx.fillText(`${val}%`, padding - 5, y + 3);
    });
  }
}

// 4. Estrategia Concreta: Deshabilitado (Vacante cerrada)
export class DisabledChartStrategy implements ChartStrategy {
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, data: number[]): void {
    ctx.clearRect(0, 0, width, height);

    // Fondo con patrón
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, width, height);

    // Líneas diagonales
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = -height; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // Icono y texto
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔒', width / 2, height / 2 - 10);

    ctx.font = 'bold 14px Arial';
    ctx.fillText('CERRADA', width / 2, height / 2 + 15);
  }
}

// 5. Estrategia para "Sin competencia"
export class NoCompetitionStrategy implements ChartStrategy {
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, data: number[]): void {
    ctx.clearRect(0, 0, width, height);

    // Fondo suave
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Icono y texto
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯', width / 2, height / 2 - 5);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('¡Sé el primero!', width / 2, height / 2 + 25);

    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial';
    ctx.fillText('No hay competencia aún', width / 2, height / 2 + 42);
  }
}
