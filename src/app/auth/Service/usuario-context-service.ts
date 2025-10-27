
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


interface UserData {
    name: string;
    roles: string[];
    email:string;
    id?: number;
    empresaId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioContextService {
  // Almacena el nombre de usuario actual
    private usernameSubject = new BehaviorSubject<string | null>(null);
    public username$ = this.usernameSubject.asObservable();

    // Almacena los roles del usuario actual
    private rolesSubject = new BehaviorSubject<string[] | null>(null);
    public roles$ = this.rolesSubject.asObservable();

    // Almacena el ID del usuario si está disponible
    private usuarioIdSubject = new BehaviorSubject<number | null>(null);
    public usuarioId$ = this.usuarioIdSubject.asObservable();

    // Almacena el token JWT
    private tokenSubject = new BehaviorSubject<string | null>(null);
    public token$ = this.tokenSubject.asObservable();

    // Almacena el ID de la empresa a la que pertenece el usuario
    private empresaIdSubject = new BehaviorSubject<number | null>(null);
    public empresaId$ = this.empresaIdSubject.asObservable();

    private usuarioCambioSubject = new BehaviorSubject<UserData | null>(null);
    public usuarioCambio$ = this.usuarioCambioSubject.asObservable();

    constructor() {
        this.cargarDatosGuardados();
    }

    /**
     * Establece los datos del usuario y actualiza el localStorage
     * 
     * @param userData - Datos del usuario
     * @param token - Token JWT opcional
     */
    setUsuarioData(userData: UserData, token?: string): void {
        // Actualizar observables
        this.usernameSubject.next(userData.name);
        this.rolesSubject.next(userData.roles);

        if (userData.id !== undefined) {
            this.usuarioIdSubject.next(userData.id);
        }

        if (userData.empresaId !== undefined) {
            this.empresaIdSubject.next(userData.empresaId);
        }

        // Si se proporciona un token, actualizarlo
        if (token) {
            this.tokenSubject.next(token);
            localStorage.setItem('authToken', token);
        }

        // Guardar datos de usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        // Notificar a los suscriptores que hubo cambio de usuario/rol
        this.usuarioCambioSubject.next(userData);
    }


    //stablece solo el nombre de usuario
    setUsername(username: string): void {
        this.usernameSubject.next(username);

        // Actualizar el objeto user en localStorage
        const userData = this.getUserData();
        if (userData) {
            userData.name = username;
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }


    //stablece los roles del usuario

    setRoles(roles: string[]): void {
        this.rolesSubject.next(roles);

        // Actualizar el objeto user en localStorage
        const userData = this.getUserData();
        if (userData) {
            userData.roles = roles;
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }

    
     //stablece el ID del usuario
    setUsuarioId(id: number): void {
        this.usuarioIdSubject.next(id);

        // Actualizar el objeto user en localStorage
        const userData = this.getUserData();
        if (userData) {
            userData.id = id;
            localStorage.setItem('user', JSON.stringify(userData));
            console.log( userData.id = id, JSON.stringify(userData))
        }
    }

    
    //tablece el ID de la empresa del usuario
    setEmpresaId(empresaId: number): void {
        this.empresaIdSubject.next(empresaId);

        // Actualizar el objeto user en localStorage
        const userData = this.getUserData();
        if (userData) {
            userData.empresaId = empresaId;
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }

    //stablece el token JWT
    setToken(token: string): void {
        this.tokenSubject.next(token);
        localStorage.setItem('authToken', token);
    }

    /**
     * Obtiene el ID del usuario actual
     */
    getUsuarioId(): number | null {
        
        return this.usuarioIdSubject.value;
    }

    /**
     * Obtiene el nombre de usuario actual
     */
    getUsername(): string | null {
        return this.usernameSubject.value;
    }

    /**
     * Obtiene los roles del usuario actual
     */
    getRoles(): string[] | null {
        return this.rolesSubject.value;
    }

    /**
     * Verifica si el usuario tiene un rol específico
     */
    tieneRol(rol: string): boolean {
        const roles = this.getRoles();
        return roles ? roles.includes(rol) : false;
    }

    /**
     * Obtiene el token JWT actual
     */
    getToken(): string | null {
        return this.tokenSubject.value;
    }

    /**
     * Obtiene el ID de la empresa del usuario
     */
    getEmpresaId(): number | null {
        return this.empresaIdSubject.value;
    }

    /**
     * Obtiene el objeto completo de datos del usuario desde localStorage
     */
    getUserData(): UserData | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr) as UserData;
        } catch (error) {
            console.error('Error al parsear datos de usuario:', error);
            return null;
        }
    }

    /**
     * Carga los datos guardados en localStorage
     */
    private cargarDatosGuardados(): void {
        try {
            // Cargar token
            const token = localStorage.getItem('authToken');
            if (token) {
                this.tokenSubject.next(token);
            }

            // Cargar datos de usuario
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr) as UserData;
                this.usernameSubject.next(userData.name);
                this.rolesSubject.next(userData.roles);

                if (userData.id !== undefined) {
                    this.usuarioIdSubject.next(userData.id);
                }

                if (userData.empresaId !== undefined) {
                    this.empresaIdSubject.next(userData.empresaId);
                }
            }
        } catch (error) {
            console.error('Error al cargar datos de usuario guardados:', error);
        }
    }

    /**
     * Limpia todos los datos del usuario
     * Útil para cuando el usuario cierra sesión
     */
    limpiarDatos(): void {
        // Limpiar observables
        this.usernameSubject.next(null);
        this.rolesSubject.next(null);
        this.usuarioIdSubject.next(null);
        this.tokenSubject.next(null);
        this.empresaIdSubject.next(null);

        // Limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }
}
