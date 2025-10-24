import { Injectable } from '@angular/core';
import { Empresa } from '../model/auth';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EmpresaContextService {
  /**
   * BehaviorSubject: Almacena un valor y notifica cuando cambia
   * Observable: Permite a los componentes suscribirse para recibir actualizaciones
   */
  
  // Almacena el objeto completo de la empresa actual
  private empresaActualSubject = new BehaviorSubject<Empresa | null>(null);
  public empresaActual$ = this.empresaActualSubject.asObservable();

  // Almacena solo el ID de la empresa seleccionada
  private empresaIdSubject = new BehaviorSubject<number | null>(null);
  public empresaId$ = this.empresaIdSubject.asObservable();

  // Almacena solo la clave de la empresa seleccionada
  private claveEmpresaSubject = new BehaviorSubject<string | null>(null);
  public claveEmpresa$ = this.claveEmpresaSubject.asObservable();

  // Almacena solo el tipo de sociedad seleccionado
  private tipoSociedadSubject = new BehaviorSubject<string | null>(null);
  public tipoSociedad$ = this.tipoSociedadSubject.asObservable();

  /**
   * El constructor se ejecuta cuando Angular instancia el servicio
   * Aprovechamos para cargar datos guardados previamente
   */
  constructor() {
    // Al iniciar la aplicación, intentamos recuperar los datos guardados
    this.cargarDatosGuardados();
  }


  setEmpresaActual(empresa: Empresa | null): void {
    // 1. Actualizamos el BehaviorSubject principal con la empresa completa
    this.empresaActualSubject.next(empresa);
    
    if (empresa) {
      // 2. Si hay una empresa seleccionada, actualizamos todos los valores individuales
      this.empresaIdSubject.next(empresa.id || null);
      this.claveEmpresaSubject.next(empresa.nombre || null);
      this.tipoSociedadSubject.next(empresa.edo || null);
      
      // 3. Guardamos en localStorage para mantener la selección entre recargas de página
      localStorage.setItem('empresaActual', JSON.stringify(empresa));
    } else {
      // 4. Si se pasó null, limpiamos todos los valores
      this.empresaIdSubject.next(null);
      this.claveEmpresaSubject.next(null);
      this.tipoSociedadSubject.next(null);
      
      // 5. Y eliminamos los datos guardados en localStorage
      localStorage.removeItem('empresaActual');
    }
  }

  setEmpresaId(id: number | null): void {
    // 1. Actualizamos el BehaviorSubject del ID
    this.empresaIdSubject.next(id);
    
    // 2. Persistimos el valor en localStorage
    if (id !== null) {
      localStorage.setItem('empresaId', id.toString());
    } else {
      localStorage.removeItem('empresaId');
    }
  }

  /**
   * Establece solo la clave de la empresa
   */
  setClaveEmpresa(clave: string | null): void {
    // 1. Actualizamos el BehaviorSubject de la clave
    this.claveEmpresaSubject.next(clave);
    
    // 2. Persistimos el valor en localStorage
    if (clave !== null) {
      localStorage.setItem('claveEmpresa', clave);
    } else {
      localStorage.removeItem('claveEmpresa');
    }
  }

  setTipoSociedad(tipo: string | null): void {
    // 1. Actualizamos el BehaviorSubject del tipo de sociedad
    this.tipoSociedadSubject.next(tipo);
    
    // 2. Persistimos el valor en localStorage
    if (tipo !== null) {
      localStorage.setItem('tipoSociedad', tipo);
    } else {
      localStorage.removeItem('tipoSociedad');
    }
  }
  getEmpresaActual(): Empresa | null {
    return this.empresaActualSubject.value;
  }

  getEmpresaId(): number | null {
    return this.empresaIdSubject.value;
  }
  getClaveEmpresa(): string | null {
    return this.claveEmpresaSubject.value;
  }
  getTipoSociedad(): string | null {
    return this.tipoSociedadSubject.value;
  }
  
  /**
   * Carga los datos guardados en localStorage
   * 
   * Este método privado se ejecuta automáticamente al iniciar la aplicación
   * para restaurar la última empresa seleccionada por el usuario.
   * 
   * FUNCIONAMIENTO:
   * 1. Intenta cargar el objeto empresa completo
   * 2. Si no existe, intenta cargar propiedades individuales
   * 3. Maneja errores de forma segura
   */
  private cargarDatosGuardados(): void {
    try {
      const empresaGuardada = localStorage.getItem('empresaActual');
      if (empresaGuardada) {
        // Si existe, lo parseamos y actualizamos todos los BehaviorSubjects
        const empresa = JSON.parse(empresaGuardada) as Empresa;
        this.empresaActualSubject.next(empresa);
        this.empresaIdSubject.next(empresa.id || null);
        this.claveEmpresaSubject.next(empresa.nombre || null);
        this.tipoSociedadSubject.next(empresa.edo || null);
      } else {
        // Si no hay empresa completa, intentar cargar valores individuales
        const empresaId = localStorage.getItem('empresaId');
        const claveEmpresa = localStorage.getItem('claveEmpresa');
        const tipoSociedad = localStorage.getItem('tipoSociedad');
        
        if (empresaId) this.empresaIdSubject.next(Number(empresaId));
        if (claveEmpresa) this.claveEmpresaSubject.next(claveEmpresa);
        if (tipoSociedad) this.tipoSociedadSubject.next(tipoSociedad);
      }
    } catch (error) {
      console.error('Error al cargar datos de empresa guardados:', error);
      // En caso de error, limpiar todo
      localStorage.removeItem('empresaActual');
      localStorage.removeItem('empresaId');
      localStorage.removeItem('claveEmpresa');
      localStorage.removeItem('tipoSociedad');
    }
  }

  /**
   * Limpia todos los datos de la empresa
   */
  limpiarDatos(): void {
    // Utilizamos el método setEmpresaActual con null para limpiar todo
    this.setEmpresaActual(null);
  }
}
