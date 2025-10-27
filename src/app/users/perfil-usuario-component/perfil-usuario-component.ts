import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DireccionService } from '../../service/direccion';
import { AuthService } from '../../service/auth';
import { UsuarioService } from '../../service/usuario-service';
import { VacanteService } from '../../service/vacante-service';
import Swal from 'sweetalert2';
import { CVCompleto } from '../../interfaces/cv.interface';
import { CvService } from '../../service/cv-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


interface Area {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-perfil-usuario-component',
  standalone: false,
  templateUrl: './perfil-usuario-component.html',
  styleUrl: './perfil-usuario-component.scss'
})
export class PerfilUsuarioComponent implements OnInit {

  perfilForm: FormGroup;
  listaColonias: string[] = [];
  listaAreas: Area[] = []; // Para el <select> de áreas
  cargando: boolean = false;
  errorCP: string | null = null;

  // Para mostrar el nombre y email del usuario autenticado
  public nombreUsuario: string = '';
  public emailUsuario: string = '';

  pdfUrl: SafeUrl | null = null; // Guardará la URL segura del PDF
  generandoPDF = false;

  // Control de estado
  modo: 'crear' | 'editar' = 'crear';
  public idUsuarioAuth: number | null = null;
  public idPerfilUsuario: number | null = null; // El ID de la tabla usuarios.usuarios


  mostrarCV = false;        // Controla si el CV (visualizador) se muestra
  cargandoCV = false;       // Muestra un 'cargando' solo la primera vez
  cvData: CVCompleto | null = null; // Almacenará los datos del CV
  errorCV: string | null = null;    // Para errores de CV

  constructor(
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private vacanteService: VacanteService,
    private cvService: CvService,
    private sanitizer: DomSanitizer
  ) {
    this.perfilForm = this.fb.group({
      // Campos de la tabla 'usuarios'
      salario: [null, [Validators.required, Validators.min(1)]],
      id_area: [null, Validators.required],

      // Campos de Dipomex
      codigo_postal: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      estado: [{ value: '', disabled: true }, Validators.required],
      municipio: [{ value: '', disabled: true }, Validators.required],
      colonia: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // 1. Obtener el ID de autenticación
    this.idUsuarioAuth = this.authService.getAuthUserId();
    if (!this.idUsuarioAuth) {
      console.error("No se pudo obtener el ID del usuario logueado");
      // Aquí deberías redirigir al login
      return;
    }
    this.cargarDatosDeLocalStorage();

    // 2. Cargar las áreas
    this.cargarAreas();

    // 3. Cargar el perfil del usuario (si existe)
    this.cargarPerfilUsuario(this.idUsuarioAuth);

    // 4. Escuchar cambios en el Código Postal
    this.escucharCambiosCP();


  }

  cargarDatosDeLocalStorage(): void {
    const userString = localStorage.getItem('user');

    if (userString) {
      try {
        const user = JSON.parse(userString);

        // Basado en el JSON que me diste: {id: 3, name: "Uriel Aguayo", ...}
        this.nombreUsuario = user.name || 'Nombre no encontrado';
        this.emailUsuario = user.email || 'Email no encontrado';

      } catch (e) {
        console.error('Error al leer datos de localStorage', e);
        this.nombreUsuario = 'Error al cargar';
        this.emailUsuario = 'Error al cargar';
      }
    }
  }

  cargarAreas(): void {
    this.vacanteService.obtenerAreas().subscribe(areas => {
      this.listaAreas = areas.data;
      console.log('Respuesta COMPLETA del servicio de Áreas:', areas);
    });
  }

  cargarPerfilUsuario(idAuth: number): void {
    this.cargando = true;
    this.usuarioService.getUsuarioPorAuthId(idAuth).subscribe({
      next: (perfilExistente) => {
        // === MODO EDICIÓN ===
        console.log("Perfil encontrado, cargando datos...", perfilExistente);
        this.modo = 'editar';
        this.idPerfilUsuario = perfilExistente.id; // Guardamos el ID del perfil

        // Buscamos el CP y le pasamos el perfil completo para que él rellene el form
        if (perfilExistente.codigo_postal) {
          // Le pasamos el perfil completo
          this.buscarCP(perfilExistente.codigo_postal, perfilExistente);
        } else {
          // Si no tiene CP, solo rellenamos los otros campos
          this.perfilForm.patchValue(perfilExistente);
          this.cargando = false;
        }
      },
      error: (err) => {
        // === MODO CREACIÓN ===
        // Un 404 aquí es normal, significa que no tiene perfil creado
        if (err.status === 404) {
          console.log("Perfil no encontrado, iniciando en modo creación.");
          this.modo = 'crear';
        } else {
          console.error("Error cargando el perfil", err);
        }
        this.cargando = false;
      }
    });
  }

  escucharCambiosCP(): void {
    this.perfilForm.get('codigo_postal')?.valueChanges.subscribe(cp => {
      // Solo busca si tiene exactamente 5 dígitos
      if (cp && cp.length === 5) {
        // Al buscar, SÍ limpiamos los campos dependientes ANTES de obtener los nuevos
        this.limpiarCamposDireccion(true); // Limpia estado, municipio, colonia
        this.buscarCP(cp, null);
      }
      // Si no tiene 5 dígitos, no hacemos nada (permite editar)
    });
  }

  // El segundo parámetro ahora es el perfil (o null si es una búsqueda nueva)
  buscarCP(cp: string, perfil: any | null): void {
    this.errorCP = null;

    if (!perfil) {
      this.cargando = true;
    }

    this.direccionService.getInfoPorCP(cp).subscribe({
      next: (data) => {

        this.listaColonias = data.colonias;

        const formUpdate: any = {
          estado: data.estado,
          municipio: data.municipio
        };

        if (perfil) {
          formUpdate.codigo_postal = perfil.codigo_postal;
          formUpdate.salario = perfil.salario;
          formUpdate.id_area = perfil.id_area;
        } else {
          formUpdate.colonia = '';
        }

        this.perfilForm.patchValue(formUpdate, { emitEvent: false });

        if (perfil) {
          setTimeout(() => {

            // Por seguridad, también lo ponemos aquí
            this.perfilForm.patchValue({
              colonia: perfil.colonia
            }, { emitEvent: false }); // <-- Añadir aquí también

            this.cargando = false;
          }, 0);
        } else {
          this.cargando = false;
        }
      },
      error: (err) => {
        this.errorCP = 'Código Postal no encontrado.';
        this.limpiarCamposDireccion(false);
        this.cargando = false;
      }
    });
  }

  limpiarCamposDireccion(soloDependientes: boolean): void {
    // Si NO es solo dependientes, borra también el CP
    if (!soloDependientes) {
      this.perfilForm.patchValue({ codigo_postal: '' }, { emitEvent: false });
    }
    // SIEMPRE borra estado, municipio y colonia
    this.perfilForm.patchValue({
      estado: '',
      municipio: '',
      colonia: ''
    }, { emitEvent: false });
    this.listaColonias = [];
    this.errorCP = null; // También limpiamos el error
  }

  onSubmit(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched(); // Marca todos los campos como "tocados" para mostrar errores
      return;
    }

    if (!this.idUsuarioAuth) {
      console.error("Error crítico: No hay ID de usuario para guardar.");
      return;
    }

    this.cargando = true;

    // Obtenemos los valores (incluidos los deshabilitados como estado y municipio)
    const formData = this.perfilForm.getRawValue();

    // Añadimos el id_userAuth (¡clave para el backend!)
    const datosParaApi = {
      ...formData,
      id_userAuth: this.idUsuarioAuth
    };

    if (this.modo === 'crear') {
      this.cargando = true;
      this.usuarioService.crearUsuario(datosParaApi).subscribe({
        next: (nuevoPerfil) => {
          console.log('Perfil creado!', nuevoPerfil);
          this.modo = 'editar';
          this.idPerfilUsuario = nuevoPerfil.id;
          this.cargando = false;

          // Alerta de ÉXITO al crear
          Swal.fire(
            '¡Perfil Creado!',
            'Tu perfil se ha guardado correctamente.',
            'success'
          );
        },
        error: (err) => {
          console.error('Error al crear perfil', err);
          this.cargando = false;
          // Alerta de ERROR
          Swal.fire(
            'Error',
            'No se pudo crear tu perfil: ' + err.message,
            'error'
          );
        }
      });
    } else if (this.modo === 'editar' && this.idPerfilUsuario) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Vas a actualizar los datos de tu perfil.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, ¡actualizar!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cargando = true;
          this.usuarioService.actualizarUsuario(this.idPerfilUsuario!, datosParaApi).subscribe({
            next: (perfilActualizado) => {
              console.log('Perfil actualizado!', perfilActualizado);
              this.cargando = false;
              Swal.fire(
                '¡Actualizado!',
                'Tu perfil se ha actualizado correctamente.',
                'success'
              );
            },
            error: (err) => {
              console.error('Error al actualizar perfil', err);
              this.cargando = false;
              // Alerta de ERROR
              Swal.fire(
                'Error',
                'No se pudo actualizar tu perfil: ' + err.message,
                'error'
              );
            }
          });
        }
      });
    }
  }
  toggleCvDisplay(): void {
    if (this.mostrarCV) {
      // Si ya se está mostrando, simplemente lo oculta
      this.mostrarCV = false;
      return;
    }

    // Si está oculto, lo muestra.
    this.mostrarCV = true;

    // Si ya lo habíamos cargado antes, no lo volvemos a pedir
    if (this.cvData) {
      return;
    }

    // Si es la primera vez, cargamos los datos
    if (this.idUsuarioAuth) { // Usa el ID de Auth (ej. 3)
      this.cargandoCV = true;
      this.errorCV = null;

      this.cvService.obtenerCV(this.idUsuarioAuth).subscribe({
        next: (data) => {
          this.cvData = data;
          this.cargandoCV = false;
        },
        error: (err) => {
          console.error("Error al cargar CV en Perfil", err);
          this.errorCV = "No se pudo cargar el CV.";
          this.cargandoCV = false;
        }
      });
    } else {
      this.errorCV = "No se pudo encontrar el ID de usuario.";
    }
  }

  generarYVisualizarPDF(): void {
    if (!this.idUsuarioAuth) return;
    this.generandoPDF = true;
    this.pdfUrl = null;

    this.cvService.generarPdfVisualizacion(this.idUsuarioAuth).subscribe({
      next: (blob: Blob) => {
        // 1. Crea una URL temporal del navegador a partir del Blob binario
        const url = URL.createObjectURL(blob);

        // 2. Sanitiza la URL para que Angular confíe en ella
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

        // 3. Abre la URL en una nueva pestaña
        window.open(this.pdfUrl.toString(), '_blank');

        this.generandoPDF = false;
      },
      error: (err) => {
        console.error('Error generando PDF:', err);
        Swal.fire('Error', 'No se pudo generar el PDF. Verifica tu conexión.', 'error');
        this.generandoPDF = false;
      }
    });
  }

}
