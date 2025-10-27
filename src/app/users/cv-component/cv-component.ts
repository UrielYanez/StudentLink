import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';
import { CVCompleto, Habilidad, Idioma } from '../../interfaces/cv.interface';
import { CvService } from '../../service/cv-service';
import { VacanteService } from '../../service/vacante-service';


// Asumo estas interfaces para tu servicio de Vacantes
interface ApiListResponse<T> { data: T[]; }
interface HabilidadMaestra { id: number; nombre: string; }
interface IdiomaMaestro { id: number; idioma: string; }

@Component({
  selector: 'app-cv-component',
  standalone: false,
  templateUrl: './cv-component.html',
  styleUrl: './cv-component.scss'
})
export class CvComponent implements OnInit {

  cvForm: FormGroup;
  cargando = true;
  idAuth: number | null = null; // El ID de Auth que viene en la URL (ej. 3)
  slug: string | null = null; // El slug que viene en la URL (ej. uriel-aguayo)



  // Listas maestras para los <select>
  listaTodasHabilidades: HabilidadMaestra[] = [];
  listaTodosIdiomas: IdiomaMaestro[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router, // Para el botón de "Cancelar" o "Volver"
    private cvService: CvService,
    private vacanteService: VacanteService, // Para Habilidades/Idiomas
    private zone: NgZone,
    
  ) {
    // Definimos la estructura del formulario CRUD
    this.cvForm = this.fb.group({
      experienciaLaboral: this.fb.array([]),
      educacion: this.fb.array([]),
      cursos: this.fb.array([]),
      habilidades: this.fb.array([]),
      idiomas: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.slug = this.route.snapshot.paramMap.get('slug');

    if (!id) {
      this.cargando = false;
      Swal.fire('Error', 'No se proporcionó un ID de usuario.', 'error');
      // Podrías redirigir de vuelta al perfil si falta el ID
      // this.router.navigate(['/ruta-del-perfil']);
      return;
    }
    this.idAuth = +id;

    this.cargarDatosIniciales(this.idAuth);
  }

  async cargarDatosIniciales(id: number) {
    this.cargando = true;
    try {
      // Usamos Promise.all para cargar todo en paralelo
      const [habilidadesRes, idiomasRes, cvData] = await Promise.all([
        this.vacanteService.obtenerHabilidades().toPromise(),
        this.vacanteService.obtenerIdiomas().toPromise(),
        this.cvService.obtenerCV(id).toPromise()
      ]);

      // Extraemos los datos de las respuestas (ajusta '.data' si es necesario)
      this.listaTodasHabilidades = (habilidadesRes as ApiListResponse<HabilidadMaestra>).data || [];
      this.listaTodosIdiomas = (idiomasRes as ApiListResponse<IdiomaMaestro>).data || [];

      this.zone.run(() => { // 3. Usa zone.run
        if (cvData) {
          this.poblarFormulario(cvData);
        } else {
          console.warn("No se encontraron datos de CV.");
        }
        this.cargando = false; // Mueve el cambio de 'cargando' aquí dentro
      });

    } catch (error: any) {
      console.error("Error cargando datos iniciales", error);
      Swal.fire('Error', 'No se pudieron cargar los datos. Detalles: ' + error.message, 'error');
      // --- También envuelve el cambio de estado en caso de error ---
      this.zone.run(() => { // 4. Usa zone.run en el catch también
        this.cargando = false;
      });
      // --- Fin de zone.run ---
    }
  }

  // === MÉTODOS PARA RELLENAR EL FORMULARIO ===
  poblarFormulario(cv: CVCompleto): void {
    // Limpia arrays por si acaso antes de rellenar
    this.experienciaLaboral.clear();
    this.educacion.clear();
    this.cursos.clear();
    this.habilidades.clear();
    this.idiomas.clear();

    // Rellena cada FormArray con los datos existentes
    cv.experienciaLaboral?.forEach(exp => this.addExperiencia(exp));
    cv.educacion?.forEach(edu => this.addEducacion(edu));
    cv.cursos?.forEach(curso => this.addCurso(curso));
    cv.habilidades?.forEach(h => this.addHabilidad(h));
    cv.idiomas?.forEach(idioma => this.addIdioma(idioma));
  }

  // === MÉTODOS PARA CREAR FORM GROUPS (para cada item en las listas) ===
  initExperiencia(exp?: any): FormGroup {
    return this.fb.group({
      empresa: [exp?.empresa || '', Validators.required],
      cargo: [exp?.cargo || '', Validators.required],
      descripcion: [exp?.descripcion || '', Validators.required]
    });
  }

  initEducacion(edu?: any): FormGroup {
    // Formatear fechas para el input type="date" (YYYY-MM-DD)
    const fechaInicio = edu?.fecha_inicio ? new Date(edu.fecha_inicio).toISOString().split('T')[0] : '';
    const fechaFin = edu?.fecha_fin ? new Date(edu.fecha_fin).toISOString().split('T')[0] : '';
    return this.fb.group({
      universidad: [edu?.universidad || '', Validators.required],
      carrera: [edu?.carrera || '', Validators.required],
      fecha_inicio: [fechaInicio, Validators.required],
      fecha_fin: [fechaFin, Validators.required]
    });
  }

  initCurso(curso?: any): FormGroup {
    return this.fb.group({
      nombre_curso: [curso?.nombre_curso || '', Validators.required],
      descripcion: [curso?.descripcion || '', Validators.required],
      curso: [curso?.curso || ''] // Link opcional
    });
  }

  initHabilidad(habilidad?: Habilidad): FormGroup { // Usamos la interfaz
    return this.fb.group({
      id_habilidad: [habilidad?.id_habilidad || null, Validators.required]
    });
  }

  initIdioma(idioma?: Idioma): FormGroup { // Usamos la interfaz
    return this.fb.group({
      id_idioma: [idioma?.id_idioma || null, Validators.required]
    });
  }

  // === MÉTODOS PARA OBTENER LOS FORM ARRAYS (Getters para el HTML) ===
  get experienciaLaboral() { return this.cvForm.get('experienciaLaboral') as FormArray; }
  get educacion() { return this.cvForm.get('educacion') as FormArray; }
  get cursos() { return this.cvForm.get('cursos') as FormArray; }
  get habilidades() { return this.cvForm.get('habilidades') as FormArray; }
  get idiomas() { return this.cvForm.get('idiomas') as FormArray; }

  // === MÉTODOS PARA AÑADIR NUEVOS ITEMS (Botón '+ Añadir') ===
  addExperiencia(exp?: any) { this.experienciaLaboral.push(this.initExperiencia(exp)); }
  addEducacion(edu?: any) { this.educacion.push(this.initEducacion(edu)); }
  addCurso(curso?: any) { this.cursos.push(this.initCurso(curso)); }
  addHabilidad(h?: any) { this.habilidades.push(this.initHabilidad(h)); }
  addIdioma(i?: any) { this.idiomas.push(this.initIdioma(i)); }

  // === MÉTODOS PARA BORRAR ITEMS (Botón 'x Eliminar') ===
  removeExperiencia(i: number) { this.experienciaLaboral.removeAt(i); }
  removeEducacion(i: number) { this.educacion.removeAt(i); }
  removeCurso(i: number) { this.cursos.removeAt(i); }
  removeHabilidad(i: number) { this.habilidades.removeAt(i); }
  removeIdioma(i: number) { this.idiomas.removeAt(i); }

  // === GUARDAR TODO EL CV ===
  onSubmit(): void {
    if (this.cvForm.invalid) {
      Swal.fire('Formulario incompleto', 'Por favor, revisa los campos marcados en rojo.', 'warning');
      this.cvForm.markAllAsTouched(); // Marca todos para mostrar errores
      return;
    }

    if (!this.idAuth) {
      Swal.fire('Error', 'No se encontró el ID de usuario para guardar.', 'error');
      return;
    }

    this.cargando = true; // Muestra spinner al guardar

    // El payload es el valor crudo del formulario
    const payload = this.cvForm.getRawValue();

    // Llamamos al servicio para actualizar
    this.cvService.actualizarCV(this.idAuth, payload).subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire({
          title: '¡Guardado!',
          text: 'Tu CV ha sido actualizado correctamente.',
          icon: 'success',
          timer: 2000, // Cierra automáticamente después de 2 segundos
          showConfirmButton: false
        }).then(() => {
          // Después de guardar, volvemos a la vista del perfil
          this.volverAlPerfil();
        });
      },
      error: (err) => {
        this.cargando = false;
        console.error("Error al actualizar CV", err);
        Swal.fire('Error al Guardar', 'No se pudo actualizar tu CV. Inténtalo de nuevo. Detalles: ' + err.message, 'error');
      }
    });
  }

  // === NAVEGACIÓN ===
  volverAlPerfil(): void {
    // Navega de vuelta a la ruta del perfil (sin '/editar')
    if (this.idAuth && this.slug) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/']); // Ruta por defecto si falta algo
    }
  }

}
