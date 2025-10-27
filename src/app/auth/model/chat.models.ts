export interface Mensaje {
  id: number;
  conversacionId: number;
  userId: number;
  username: string;
  contenido: string;
  fechaEnvio: Date;
  fechaEdicion?: Date;
  leido: boolean;
}

export interface Conversacion {
  id: number;
  nombre: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  mensajes: Mensaje[];
}

export interface WebSocketMessage {
  tipo: string;
  mensaje?: Mensaje;
  content?: string;
  timestamp: Date;
}

export interface UsuarioEscribiendo {
  usuario: string;
  escribiendo: boolean;
}