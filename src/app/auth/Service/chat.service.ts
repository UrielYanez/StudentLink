import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Conversacion, Mensaje, UsuarioEscribiendo, WebSocketMessage } from '../model/chat.models';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private wsUrl =  `${environment.apiUrl}/ws-chat`;
  
  
  private client: Client;
  private subscriptions: Map<number, StompSubscription> = new Map();
  
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();
  
  private conversacionesSubject = new BehaviorSubject<Conversacion[]>([]);
  public conversaciones$ = this.conversacionesSubject.asObservable();
  
  private usuariosEscribiendoSubject = new BehaviorSubject<Map<string, boolean>>(new Map());
  public usuariosEscribiendo$ = this.usuariosEscribiendoSubject.asObservable();
  
  private conectadoSubject = new BehaviorSubject<boolean>(false);
  public conectado$ = this.conectadoSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.client = new Client();
    this.configurarWebSocket();
  }
  
  private configurarWebSocket(): void {
    this.client.webSocketFactory = () => new SockJS(this.wsUrl);
    
    this.client.onConnect = () => {
      console.log('Conectado al servidor WebSocket');
      this.conectadoSubject.next(true);
    };
    
    this.client.onDisconnect = () => {
      console.log('Desconectado del servidor WebSocket');
      this.conectadoSubject.next(false);
    };
    
    this.client.onStompError = (frame) => {
      console.error('Error STOMP:', frame);
    };
  }
  
  conectar(): Observable<boolean> {
    return new Observable(observer => {
      if (this.client.active) {
        observer.next(true);
        observer.complete();
        return;
      }
      
      // Obtener el token del localStorage
      const token = localStorage.getItem('authToken');
      
      // Configurar los headers con el token
      this.client.connectHeaders = {
        'Authorization': `Bearer ${token}`
      };
      
      this.client.activate();
      
      const timeout = setTimeout(() => {
        observer.error('Timeout conectando al WebSocket');
      }, 5000);
      
      const checkConnection = setInterval(() => {
        if (this.client.active) {
          clearInterval(checkConnection);
          clearTimeout(timeout);
          observer.next(true);
          observer.complete();
        }
      }, 100);
    });
  }
  
  desconectar(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    if (this.client.active) {
      this.client.deactivate();
    }
  }
  
  obtenerConversaciones(): Observable<Conversacion[]> {
    return this.http.get<Conversacion[]>(`${this.apiUrl}/conversaciones`);
  }
  
  crearConversacion(nombre: string): Observable<Conversacion> {
    return this.http.post<Conversacion>(`${this.apiUrl}/conversaciones`, null, {
      params: { nombre }
    });
  }
  
  obtenerConversacion(id: number): Observable<Conversacion> {
    return this.http.get<Conversacion>(`${this.apiUrl}/conversaciones/${id}`);
  }
  
  eliminarConversacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversaciones/${id}`);
  }
  
  actualizarNombreConversacion(id: number, nombre: string): Observable<Conversacion> {
    return this.http.put<Conversacion>(`${this.apiUrl}/conversaciones/${id}`, null, {
      params: { nombre }
    });
  }
  
  suscribirseAConversacion(conversacionId: number): Observable<WebSocketMessage> {
    return new Observable(observer => {
      if (!this.client.active) {
        observer.error('WebSocket no conectado');
        return;
      }
      
      const subscription = this.client.subscribe(
        `/topic/conversacion/${conversacionId}`,
        (message) => {
          try {
            const payload = JSON.parse(message.body);
            observer.next(payload);
          } catch (e) {
            observer.error(e);
          }
        }
      );
      
      this.subscriptions.set(conversacionId, subscription);
      
      return () => {
        subscription.unsubscribe();
        this.subscriptions.delete(conversacionId);
      };
    });
  }
  
  suscribirseAUsuariosEscribiendo(conversacionId: number): Observable<UsuarioEscribiendo> {
    return new Observable(observer => {
      if (!this.client.active) {
        observer.error('WebSocket no conectado');
        return;
      }
      
      const subscription = this.client.subscribe(
        `/topic/conversacion/${conversacionId}/escribiendo`,
        (message) => {
          try {
            const payload = JSON.parse(message.body);
            observer.next(payload);
          } catch (e) {
            observer.error(e);
          }
        }
      );
      
      return () => subscription.unsubscribe();
    });
  }
  
  enviarMensaje(conversacionId: number, contenido: string): void {
    if (!this.client.active) {
      console.error('WebSocket no conectado');
      return;
    }
    
    this.client.publish({
      destination: `/app/chat/${conversacionId}/enviar`,
      body: JSON.stringify({ conversacionId, contenido })
    });
  }
  
  notificarEscribiendo(conversacionId: number): void {
    if (!this.client.active) return;
    
    this.client.publish({
      destination: `/app/chat/${conversacionId}/escribiendo`
    });
  }
  
  notificarDejaEscribir(conversacionId: number): void {
    if (!this.client.active) return;
    
    this.client.publish({
      destination: `/app/chat/${conversacionId}/dejar-escribir`
    });
  }
  
  marcarComoLeido(conversacionId: number, mensajeId: number): void {
    if (!this.client.active) return;
    
    this.client.publish({
      destination: `/app/chat/${conversacionId}/marcar-leido`,
      body: JSON.stringify(mensajeId)
    });
  }
  
  editarMensaje(conversacionId: number, mensajeId: number, contenido: string): void {
    if (!this.client.active) return;
    
    this.client.publish({
      destination: `/app/chat/${conversacionId}/editar`,
      body: JSON.stringify({ mensajeId, contenido })
    });
  }
}