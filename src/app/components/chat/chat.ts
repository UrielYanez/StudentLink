import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Conversacion, Mensaje } from '../../auth/model/chat.models';
import { ChatService } from '../../auth/Service/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [ChatService],
  template: `
    <!-- Botón flotante -->
    <button 
      *ngIf="!chatAbierto" 
      (click)="abrirChat()" 
      class="chat-button"
      [class.con-notificaciones]="tieneNotificaciones"
    >
      💬
      <span *ngIf="tieneNotificaciones" class="badge">{{ contarMensajesNoLeidos() }}</span>
    </button>

    <!-- Chat flotante -->
    <div *ngIf="chatAbierto" class="chat-flotante" [@slideInOut]>
      <!-- Header -->
      <div class="chat-header-flotante">
        <div class="header-content">
          <h3>Conversaciones</h3>
          <button (click)="cerrarChat()" class="btn-cerrar">✕</button>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="chat-body-flotante">
        <!-- Lista de conversaciones (si no hay seleccionada) -->
        <div *ngIf="!conversacionSeleccionada" class="conversaciones-view">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Buscar conversaciones..."
              [(ngModel)]="filtroConversaciones"
              class="search-input"
            />
          </div>

          <button (click)="abrirDialogoNuevaConversacion()" class="btn-nueva-conv">
            + Nueva conversación
          </button>

          <div class="conversaciones-lista-flotante">
            <div *ngIf="conversacionesFiltradas().length === 0" class="empty">
              Sin conversaciones
            </div>
            <div
              *ngFor="let conv of conversacionesFiltradas()"
              (click)="seleccionarConversacion(conv)"
              class="conv-item-flotante"
            >
              <div class="conv-header">
                <span class="conv-nombre">{{ conv.nombre }}</span>
                <span class="conv-fecha">{{ conv.fechaActualizacion | date: 'short' }}</span>
              </div>
              <span *ngIf="obtenerMensajesNoLeidos(conv.id) > 0" class="unread-badge">
                {{ obtenerMensajesNoLeidos(conv.id) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Vista de chat -->
        <div *ngIf="conversacionSeleccionada" class="chat-view">
          <!-- Header de conversación -->
          <div class="conv-header-flotante">
            <button (click)="volverAConversaciones()" class="btn-atras">←</button>
            <div class="conv-info">
              <h4>{{ conversacionSeleccionada.nombre }}</h4>
              <span class="online-indicator">En línea</span>
            </div>
            <button (click)="eliminarConversacion()" class="btn-delete">🗑</button>
          </div>

          <!-- Mensajes -->
          <div class="mensajes-flotante" #mensajesContainer>
            <div *ngFor="let mensaje of mensajesMostrados" 
              class="mensaje-bubble"
              [class.propio]="esPropio(mensaje)"
            >
              <div class="bubble-wrapper">
                <div class="user-info">{{ mensaje.username }}</div>
                <div class="bubble-content">
                  <p>{{ mensaje.contenido }}</p>
                  <span *ngIf="mensaje.fechaEdicion" class="editado-tag">(editado)</span>
                </div>
              </div>
              <span class="timestamp">{{ mensaje.fechaEnvio | date: 'HH:mm' }}</span>
              <button 
                *ngIf="esPropio(mensaje)" 
                (click)="abrirDialogoEditar(mensaje)"
                class="btn-edit-msg"
                title="Editar"
              >✎</button>
            </div>

            <!-- Indicador escribiendo -->
            <div *ngIf="usuariosEscribiendo.size > 0" class="escribiendo-indicator">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
              <small>{{ usuariosEscribiendoArray[0] }} está escribiendo...</small>
            </div>
          </div>

          <!-- Input -->
          <div class="input-flotante">
            <input
              type="text"
              [(ngModel)]="nuevoMensaje"
              (keyup)="alEscribir()"
              (keyup.enter)="enviarMensaje()"
              placeholder="Escribe un mensaje..."
              class="input-msg"
            />
            <button 
              (click)="enviarMensaje()" 
              [disabled]="!nuevoMensaje.trim()"
              class="btn-send-msg"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog nueva conversación -->
    <div *ngIf="mostrarDialogoNueva" class="dialog-overlay" (click)="cerrarDialogos()">
      <div class="dialog-modal" (click)="$event.stopPropagation()">
        <h3>Nueva Conversación</h3>
        <input
          type="text"
          [(ngModel)]="nombreNuevaConversacion"
          placeholder="Nombre..."
          class="dialog-input"
          autofocus
        />
        <div class="dialog-actions">
          <button (click)="crearConversacion()" class="btn-create">Crear</button>
          <button (click)="cerrarDialogos()" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Dialog editar mensaje -->
    <div *ngIf="mostrarDialogoEditar" class="dialog-overlay" (click)="cerrarDialogos()">
      <div class="dialog-modal" (click)="$event.stopPropagation()">
        <h3>Editar Mensaje</h3>
        <textarea [(ngModel)]="textoEdicion" class="dialog-textarea"></textarea>
        <div class="dialog-actions">
          <button (click)="guardarEdicion()" class="btn-create">Guardar</button>
          <button (click)="cerrarDialogos()" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Botón flotante */
    .chat-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
      transition: all 0.3s ease;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 123, 255, 0.6);
      }

      &:active {
        transform: scale(0.95);
      }

      &.con-notificaciones {
        animation: pulse 2s infinite;
      }

      .badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4444;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* Chat flotante */
    .chat-flotante {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 350px;
      height: 450px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
      display: flex;
      flex-direction: column;
      z-index: 998;
      animation: slideUp 0.3s ease;

      @media (max-width: 480px) {
        width: calc(100% - 32px);
        height: calc(100vh - 140px);
        bottom: 80px;
        right: 16px;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Header flotante */
    .chat-header-flotante {
      padding: 16px;
      border-bottom: 1px solid #e8e8e8;
      background: linear-gradient(135deg, #f8f9fa 0%, #f0f1f3 100%);
      border-radius: 12px 12px 0 0;

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 600;
        }

        .btn-cerrar {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;

          &:hover {
            background: rgba(0, 0, 0, 0.08);
            color: #333;
          }
        }
      }
    }

    /* Body */
    .chat-body-flotante {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Vista conversaciones */
    .conversaciones-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 12px;

      .search-box {
        margin-bottom: 12px;

        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;

          &:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          }
        }
      }

      .btn-nueva-conv {
        padding: 10px 12px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 12px;
        transition: background 0.2s;

        &:hover {
          background: #0056b3;
        }
      }

      .conversaciones-lista-flotante {
        flex: 1;
        overflow-y: auto;

        .empty {
          text-align: center;
          color: #999;
          padding: 24px 12px;
          font-size: 14px;
        }

        .conv-item-flotante {
          padding: 12px;
          margin-bottom: 8px;
          background: #f9f9f9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;

          &:hover {
            background: #e8e8e8;
            transform: translateX(4px);
          }

          .conv-header {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;

            .conv-nombre {
              font-weight: 500;
              color: #333;
              font-size: 14px;
            }

            .conv-fecha {
              font-size: 12px;
              color: #999;
            }
          }

          .unread-badge {
            background: #ff4444;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
          }
        }
      }
    }

    /* Vista chat */
    .chat-view {
      display: flex;
      flex-direction: column;
      height: 100%;

      .conv-header-flotante {
        padding: 12px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        align-items: center;
        gap: 8px;

        .btn-atras {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
          color: #666;

          &:hover {
            color: #333;
          }
        }

        .conv-info {
          flex: 1;

          h4 {
            margin: 0;
            font-size: 14px;
            color: #333;
            font-weight: 600;
          }

          .online-indicator {
            font-size: 12px;
            color: #28a745;
            display: block;
          }
        }

        .btn-delete {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #666;
          padding: 4px 8px;

          &:hover {
            color: #d32f2f;
          }
        }
      }

      .mensajes-flotante {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .mensaje-bubble {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          animation: fadeIn 0.3s ease;

          &.propio {
            justify-content: flex-end;

            .bubble-wrapper {
              align-items: flex-end;

              .user-info {
                text-align: right;
                color: #007bff;
              }

              .bubble-content {
                background: #007bff;
                color: white;
                border-radius: 18px 4px 18px 18px;
              }
            }
          }

          &:not(.propio) {
            justify-content: flex-start;

            .bubble-wrapper {
              align-items: flex-start;

              .user-info {
                text-align: left;
                color: #666;
              }

              .bubble-content {
                background: #e8e8e8;
                color: #333;
                border-radius: 4px 18px 18px 18px;
              }
            }
          }

          .bubble-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-width: 70%;

            .user-info {
              font-size: 12px;
              font-weight: 600;
              padding: 0 12px;
            }

            .bubble-content {
              padding: 10px 14px;
              word-wrap: break-word;
              font-size: 14px;
              line-height: 1.4;
              border-radius: 18px;

              p {
                margin: 0 0 4px 0;
              }

              .editado-tag {
                font-size: 11px;
                opacity: 0.7;
                font-style: italic;
              }
            }
          }

          .timestamp {
            font-size: 11px;
            color: #999;
            white-space: nowrap;
            padding: 0 4px;
          }

          .btn-edit-msg {
            background: none;
            border: none;
            color: #007bff;
            cursor: pointer;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.2s;

            &:hover {
              text-decoration: underline;
            }
          }

          &:hover .btn-edit-msg {
            opacity: 1;
          }
        }

        .escribiendo-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px;
          color: #999;
          font-size: 12px;

          .typing-dots {
            display: flex;
            gap: 3px;

            span {
              width: 6px;
              height: 6px;
              background: #ccc;
              border-radius: 50%;
              animation: typing 1.4s infinite;

              &:nth-child(2) {
                animation-delay: 0.2s;
              }

              &:nth-child(3) {
                animation-delay: 0.4s;
              }
            }
          }
        }

        @keyframes typing {
          0%, 60%, 100% { opacity: 0.5; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-6px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      }

      .input-flotante {
        padding: 12px;
        border-top: 1px solid #e8e8e8;
        display: flex;
        gap: 8px;

        .input-msg {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          resize: none;

          &:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          }
        }

        .btn-send-msg {
          padding: 8px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;

          &:hover:not(:disabled) {
            background: #0056b3;
          }

          &:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        }
      }
    }

    /* Dialogs */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;

      .dialog-modal {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        min-width: 300px;
        max-width: 500px;

        h3 {
          margin: 0 0 16px;
          font-size: 16px;
          color: #333;
        }

        .dialog-input, .dialog-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 16px;
          box-sizing: border-box;
          font-family: inherit;

          &:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          }
        }

        .dialog-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .dialog-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;

          button {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;

            &.btn-create {
              background: #007bff;
              color: white;

              &:hover {
                background: #0056b3;
              }
            }

            &.btn-cancel {
              background: #e8e8e8;
              color: #333;

              &:hover {
                background: #d0d0d0;
              }
            }
          }
        }
      }
    }

    /* Scrollbar personalizado */
    .conversaciones-lista-flotante::-webkit-scrollbar,
    .mensajes-flotante::-webkit-scrollbar {
      width: 6px;
    }

    .conversaciones-lista-flotante::-webkit-scrollbar-track,
    .mensajes-flotante::-webkit-scrollbar-track {
      background: transparent;
    }

    .conversaciones-lista-flotante::-webkit-scrollbar-thumb,
    .mensajes-flotante::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;

      &:hover {
        background: #999;
      }
    }
  `]
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  chatAbierto = false;
  conversaciones: Conversacion[] = [];
  conversacionSeleccionada: Conversacion | null = null;
  mensajesMostrados: Mensaje[] = [];
  nuevoMensaje = '';
  filtroConversaciones = '';
  
  mostrarDialogoNueva = false;
  mostrarDialogoEditar = false;
  
  nombreNuevaConversacion = '';
  textoEdicion = '';
  mensajeEnEdicion: Mensaje | null = null;
  
  usuariosEscribiendo = new Map<string, boolean>();
  private tiempoEscritura: NodeJS.Timeout | null = null;
  
  private subscriptions: Subscription[] = [];
  tieneNotificaciones = false;
  usuarioActualId: number | null = null;
  usuarioActualUsername: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.inicializar();
  }

  private inicializar(): void {
    // Obtener el usuario actual del localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        this.usuarioActualUsername = payload.sub; // El 'sub' es el username en tu JWT
      } catch (e) {
        console.error('Error decodificando token:', e);
      }
    }

    this.chatService.conectar().subscribe({
      next: () => {
        console.log('Conectado al servidor WebSocket');
        this.cargarConversaciones();
      },
      error: (err) => {
        console.error('Error conectando:', err);
      }
    });
  }

  abrirChat(): void {
    this.chatAbierto = true;
    this.tieneNotificaciones = false;
  }

  cerrarChat(): void {
    this.chatAbierto = false;
    this.conversacionSeleccionada = null;
  }

  cargarConversaciones(): void {
    this.chatService.obtenerConversaciones().subscribe({
      next: (conversaciones) => {
        this.conversaciones = conversaciones;
      },
      error: (err) => console.error('Error cargando conversaciones:', err)
    });
  }

  conversacionesFiltradas(): Conversacion[] {
    return this.conversaciones.filter(conv =>
      conv.nombre.toLowerCase().includes(this.filtroConversaciones.toLowerCase())
    );
  }

  seleccionarConversacion(conversacion: Conversacion): void {
    this.conversacionSeleccionada = conversacion;
    this.mensajesMostrados = conversacion.mensajes || [];
    this.suscribirseAConversacion();
  }

  private suscribirseAConversacion(): void {
    if (!this.conversacionSeleccionada) return;

    const mensajesSub = this.chatService.suscribirseAConversacion(this.conversacionSeleccionada.id).subscribe({
      next: (wsMessage) => {
        if (wsMessage.tipo === 'NUEVO_MENSAJE' && wsMessage.mensaje) {
          this.mensajesMostrados.push(wsMessage.mensaje);
          this.scrollAlFinal();
        } else if (wsMessage.tipo === 'MENSAJE_EDITADO' && wsMessage.mensaje) {
          const index = this.mensajesMostrados.findIndex(m => m.id === wsMessage.mensaje?.id);
          if (index !== -1) {
            this.mensajesMostrados[index] = wsMessage.mensaje;
          }
        }
      },
      error: (err) => console.error('Error en suscripción:', err)
    });

    const escribiendoSub = this.chatService.suscribirseAUsuariosEscribiendo(this.conversacionSeleccionada.id).subscribe({
      next: (data) => {
        if (data.escribiendo) {
          this.usuariosEscribiendo.set(data.usuario, true);
        } else {
          this.usuariosEscribiendo.delete(data.usuario);
        }
      },
      error: (err) => console.error('Error en escribiendo:', err)
    });

    this.subscriptions.push(mensajesSub, escribiendoSub);
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || !this.conversacionSeleccionada) return;

    this.chatService.enviarMensaje(this.conversacionSeleccionada.id, this.nuevoMensaje);
    this.nuevoMensaje = '';
    this.chatService.notificarDejaEscribir(this.conversacionSeleccionada.id);
  }

  alEscribir(): void {
    if (!this.conversacionSeleccionada) return;

    if (this.tiempoEscritura) clearTimeout(this.tiempoEscritura);

    this.chatService.notificarEscribiendo(this.conversacionSeleccionada.id);

    this.tiempoEscritura = setTimeout(() => {
      this.chatService.notificarDejaEscribir(this.conversacionSeleccionada!.id);
    }, 3000);
  }

  abrirDialogoNuevaConversacion(): void {
    this.mostrarDialogoNueva = true;
  }

  crearConversacion(): void {
    if (!this.nombreNuevaConversacion.trim()) return;

    this.chatService.crearConversacion(this.nombreNuevaConversacion).subscribe({
      next: (conversacion) => {
        this.conversaciones.push(conversacion);
        this.cerrarDialogos();
      },
      error: (err) => console.error('Error creando conversación:', err)
    });
  }

  abrirDialogoEditar(mensaje: Mensaje): void {
    this.mensajeEnEdicion = mensaje;
    this.textoEdicion = mensaje.contenido;
    this.mostrarDialogoEditar = true;
  }

  guardarEdicion(): void {
    if (!this.textoEdicion.trim() || !this.mensajeEnEdicion || !this.conversacionSeleccionada) return;

    this.chatService.editarMensaje(
      this.conversacionSeleccionada.id,
      this.mensajeEnEdicion.id,
      this.textoEdicion
    );
    this.cerrarDialogos();
  }

  eliminarConversacion(): void {
    if (!this.conversacionSeleccionada || !confirm('¿Eliminar esta conversación?')) return;

    this.chatService.eliminarConversacion(this.conversacionSeleccionada.id).subscribe({
      next: () => {
        const index = this.conversaciones.findIndex(c => c.id === this.conversacionSeleccionada!.id);
        if (index !== -1) this.conversaciones.splice(index, 1);
        this.conversacionSeleccionada = null;
      },
      error: (err) => console.error('Error eliminando:', err)
    });
  }

  volverAConversaciones(): void {
    this.conversacionSeleccionada = null;
  }

  cerrarDialogos(): void {
    this.mostrarDialogoNueva = false;
    this.mostrarDialogoEditar = false;
    this.nombreNuevaConversacion = '';
    this.textoEdicion = '';
    this.mensajeEnEdicion = null;
  }

  esPropio(mensaje: Mensaje): boolean {
    // Comparar el username del mensaje con el usuario actual
    return mensaje.username === this.usuarioActualUsername;
  }

  obtenerMensajesNoLeidos(conversacionId: number): number {
    return this.conversaciones
      .find(c => c.id === conversacionId)
      ?.mensajes?.filter(m => !m.leido).length || 0;
  }

  contarMensajesNoLeidos(): number {
    return this.conversaciones.reduce((total, conv) => 
      total + (conv.mensajes?.filter(m => !m.leido).length || 0), 0
    );
  }

  scrollAlFinal(): void {
    setTimeout(() => {
      if (this.mensajesContainer) {
        this.mensajesContainer.nativeElement.scrollTop = 
          this.mensajesContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

  get usuariosEscribiendoArray(): string[] {
    return Array.from(this.usuariosEscribiendo.keys());
  }

  ngAfterViewChecked(): void {
    this.scrollAlFinal();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.tiempoEscritura) clearTimeout(this.tiempoEscritura);
    this.chatService.desconectar();
  }
}