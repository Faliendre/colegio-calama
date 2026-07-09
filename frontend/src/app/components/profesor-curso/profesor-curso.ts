import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfesorService } from '../../services/profesor.service';
import * as XLSX from 'xlsx';


interface Alumno {
  id: number;
  codigo_rude: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  matricula_id: number;
  estado?: string;
}

@Component({
  selector: 'app-profesor-curso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profesor-curso.component.html',
  styleUrls: ['./profesor-curso.css']
})
export class ProfesorCursoComponent implements OnInit {
  // Info del curso
  cursoId: number = 0;
  asignacionId: number = 0;
  materiaId: number = 0;
  grado: string = '';
  paralelo: string = '';
  materia: string = '';

  // Datos
  alumnos: Alumno[] = [];
  loading: boolean = true;
  searchText: string = '';

  get filteredAlumnos(): Alumno[] {
    if (!this.searchText) {
      return this.alumnos;
    }
    const search = this.searchText.toLowerCase();
    return this.alumnos.filter(a => 
      (a.nombre && a.nombre.toLowerCase().includes(search)) ||
      (a.apellido_paterno && a.apellido_paterno.toLowerCase().includes(search)) ||
      (a.apellido_materno && a.apellido_materno.toLowerCase().includes(search)) ||
      (a.codigo_rude && a.codigo_rude.toLowerCase().includes(search))
    );
  }

  get filteredAsistenciasGuardadas(): any[] {
    if (!this.searchText) {
      return this.asistenciasGuardadas;
    }
    const search = this.searchText.toLowerCase();
    return this.asistenciasGuardadas.filter(a => 
      (a.nombre && a.nombre.toLowerCase().includes(search)) ||
      (a.apellido_paterno && a.apellido_paterno.toLowerCase().includes(search)) ||
      (a.apellido_materno && a.apellido_materno.toLowerCase().includes(search)) ||
      (a.codigo_rude && a.codigo_rude.toLowerCase().includes(search))
    );
  }

  get filteredCalificaciones(): any[] {
    if (!this.searchText) {
      return this.calificaciones;
    }
    const search = this.searchText.toLowerCase();
    return this.calificaciones.filter(c => 
      (c.alumno_nombre && c.alumno_nombre.toLowerCase().includes(search))
    );
  }

  get filteredCalificacionesGuardadas(): any[] {
    if (!this.searchText) {
      return this.calificacionesGuardadas;
    }
    const search = this.searchText.toLowerCase();
    return this.calificacionesGuardadas.filter(c => 
      (c.nombre && c.nombre.toLowerCase().includes(search)) ||
      (c.apellido_paterno && c.apellido_paterno.toLowerCase().includes(search)) ||
      (c.apellido_materno && c.apellido_materno.toLowerCase().includes(search)) ||
      (c.codigo_rude && c.codigo_rude.toLowerCase().includes(search))
    );
  }

  get filteredPromedios(): any[] {
    if (!this.searchText) {
      return this.promedios;
    }
    const search = this.searchText.toLowerCase();
    return this.promedios.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(search)) ||
      (p.apellido_paterno && p.apellido_paterno.toLowerCase().includes(search)) ||
      (p.apellido_materno && p.apellido_materno.toLowerCase().includes(search)) ||
      (p.codigo_rude && p.codigo_rude.toLowerCase().includes(search))
    );
  }

  // Tabs
  activeTab: string = 'asistencia';

  // Asistencia - Registro nuevo
  fechaAsistencia: string = new Date().toISOString().split('T')[0];
  guardandoAsistencia: boolean = false;

  // Asistencia - Ver/Editar historial
  mostrandoHistorialAsistencia: boolean = false;
  fechaConsulta: string = new Date().toISOString().split('T')[0];
  asistenciasGuardadas: any[] = [];
  cargandoAsistencias: boolean = false;
  editandoAsistencia: boolean = false;

  // Calificaciones
  trimestres: any[] = [];
  trimestreSeleccionado: number = 0;
  criterios: any[] = [];
  mostrarFormCriterio: boolean = false;
  nuevoCriterio = { nombre: '' };
  guardandoCriterio: boolean = false;

  // Ingreso de notas
  criterioSeleccionado: any = null;
  mostrandoFormNotas: boolean = false;
  calificaciones: any[] = [];
  guardandoCalificaciones: boolean = false;

  // Ver/Editar calificaciones
  mostrandoCalificacionesGuardadas: boolean = false;
  criterioConsulta: any = null;
  calificacionesGuardadas: any[] = [];
  cargandoCalificacionesGuardadas: boolean = false;
  editandoNota: boolean = false;

  // Promedios
  mostrandoPromedios: boolean = false;
  promedios: any[] = [];
  cargandoPromedios: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profesorService: ProfesorService
  ) { }

  ngOnInit(): void {
    // Obtener parámetros de la URL
    this.route.params.subscribe(params => {
      this.cursoId = +params['id'];
    });

    this.route.queryParams.subscribe(params => {
      this.asignacionId = +params['asignacion_id'];
      this.materiaId = +params['materia_id'];
      this.grado = params['grado'];
      this.paralelo = params['paralelo'];
      this.materia = params['materia'];
    });

    this.loadAlumnos();
    this.loadTrimestres();
  }

  // ==================== CARGA DE DATOS ====================

  loadAlumnos(): void {
    this.profesorService.getAlumnosPorCurso(this.cursoId).subscribe({
      next: (data) => {
        this.alumnos = data.map(alumno => ({
          ...alumno,
          estado: 'presente'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando alumnos:', err);
        this.loading = false;
      }
    });
  }

  loadTrimestres(): void {
    this.profesorService.getTrimestres().subscribe({
      next: (data) => {
        this.trimestres = data.map(t => ({
          id: t.id,
          nombre: `Trimestre ${t.numero}`
        }));
        if (data.length > 0) {
          this.trimestreSeleccionado = data[0].id;
          this.loadCriterios();
        }
      },
      error: (err) => console.error('Error cargando trimestres:', err)
    });
  }

  loadCriterios(): void {
    if (!this.trimestreSeleccionado || !this.asignacionId) return;

    this.profesorService.getCriterios(this.asignacionId, this.trimestreSeleccionado).subscribe({
      next: (data) => {
        this.criterios = data;
        console.log('Criterios cargados:', data);
      },
      error: (err) => console.error('Error cargando criterios:', err)
    });
  }

  // ==================== NAVEGACIÓN ====================

  cambiarTab(tab: string): void {
    this.activeTab = tab;
  }

  cambiarTrimestre(trimestreId: number): void {
    this.trimestreSeleccionado = trimestreId;
    this.loadCriterios();
  }

  volver(): void {
    this.router.navigate(['/profesor/dashboard']);
  }

  // ==================== ASISTENCIA - REGISTRO NUEVO ====================

  cambiarEstado(alumno: Alumno, estado: string): void {
    alumno.estado = estado;
  }

  guardarAsistencia(): void {
    this.guardandoAsistencia = true;

    const asistencias = this.alumnos.map(alumno => ({
      alumno_id: alumno.id,
      estado: alumno.estado || 'presente',
      observaciones: ''
    }));

    const data = {
      asignacion_profesor_id: this.asignacionId,
      fecha: this.fechaAsistencia,
      asistencias: asistencias
    };

    this.profesorService.registrarAsistencia(data).subscribe({
      next: (response) => {
        alert('✅ Asistencia registrada exitosamente');
        this.guardandoAsistencia = false;
      },
      error: (err) => {
        console.error('Error guardando asistencia:', err);
        alert('❌ Error al guardar asistencia');
        this.guardandoAsistencia = false;
      }
    });
  }

  // ==================== ASISTENCIA - VER/EDITAR HISTORIAL ====================

  toggleHistorialAsistencia(): void {
    this.mostrandoHistorialAsistencia = !this.mostrandoHistorialAsistencia;
    if (this.mostrandoHistorialAsistencia) {
      this.consultarAsistencias();
    }
  }

  consultarAsistencias(): void {
    this.cargandoAsistencias = true;

    this.profesorService.getAsistenciasPorFecha(this.asignacionId, this.fechaConsulta).subscribe({
      next: (data) => {
        this.asistenciasGuardadas = data;
        this.cargandoAsistencias = false;
      },
      error: (err) => {
        console.error('Error cargando asistencias:', err);
        this.asistenciasGuardadas = [];
        this.cargandoAsistencias = false;
      }
    });
  }

  cambiarEstadoGuardado(asistencia: any, nuevoEstado: string): void {
    this.editandoAsistencia = true;

    const data = {
      estado: nuevoEstado,
      observaciones: asistencia.observaciones || ''
    };

    this.profesorService.editarAsistencia(asistencia.asistencia_id, data).subscribe({
      next: (response) => {
        asistencia.estado = nuevoEstado;
        alert('✅ Asistencia actualizada');
        this.editandoAsistencia = false;
      },
      error: (err) => {
        console.error('Error editando asistencia:', err);
        alert('❌ Error al editar asistencia');
        this.editandoAsistencia = false;
      }
    });
  }

  // ==================== CALIFICACIONES - CRITERIOS ====================

  toggleFormCriterio(): void {
    this.mostrarFormCriterio = !this.mostrarFormCriterio;
  }

  crearCriterio(): void {
    if (!this.nuevoCriterio.nombre) {
      alert('❌ Ingresa el nombre de la evaluación');
      return;
    }

    this.guardandoCriterio = true;

    const criterioData = {
      asignacion_profesor_id: this.asignacionId,
      trimestre_id: this.trimestreSeleccionado,
      nombre: this.nuevoCriterio.nombre,
      ponderacion: 100
    };

    this.profesorService.crearCriterio(criterioData).subscribe({
      next: (response) => {
        alert('✅ Evaluación creada exitosamente');
        this.mostrarFormCriterio = false;
        this.nuevoCriterio = { nombre: '' };
        this.guardandoCriterio = false;
        this.loadCriterios();
      },
      error: (err) => {
        console.error('Error creando criterio:', err);
        alert('❌ Error al crear evaluación');
        this.guardandoCriterio = false;
      }
    });
  }


  // ==================== CALIFICACIONES - NOTAS ====================

  prepararCalificaciones(criterio: any): void {
    this.criterioSeleccionado = criterio;
    this.mostrandoFormNotas = true;

    this.calificaciones = this.alumnos.map(alumno => ({
      alumno_id: alumno.id,
      alumno_nombre: `${alumno.apellido_paterno} ${alumno.apellido_materno}, ${alumno.nombre}`,
      nota: 0
    }));
  }

  cerrarFormNotas(): void {
    this.mostrandoFormNotas = false;
    this.criterioSeleccionado = null;
  }

  guardarCalificaciones(): void {
    this.guardandoCalificaciones = true;

    const data = {
      criterio_evaluacion_id: this.criterioSeleccionado.id,
      calificaciones: this.calificaciones.map(c => ({
        alumno_id: c.alumno_id,
        nota: c.nota,
        observaciones: ''
      }))
    };

    this.profesorService.registrarCalificaciones(data).subscribe({
      next: (response) => {
        alert('✅ Calificaciones guardadas exitosamente');
        this.guardandoCalificaciones = false;
        this.cerrarFormNotas();
      },
      error: (err) => {
        console.error('Error guardando calificaciones:', err);
        alert('❌ Error: ' + (err.error?.message || 'Error desconocido'));
        this.guardandoCalificaciones = false;
      }
    });
  }
  // ==================== CALIFICACIONES - VER/EDITAR ====================

  verCalificacionesGuardadas(criterio: any): void {
    this.criterioConsulta = criterio;
    this.mostrandoCalificacionesGuardadas = true;
    this.cargarCalificacionesGuardadas();
  }

  cargarCalificacionesGuardadas(): void {
    this.cargandoCalificacionesGuardadas = true;

    this.profesorService.getCalificacionesPorCriterio(this.criterioConsulta.id).subscribe({
      next: (data) => {
        this.calificacionesGuardadas = data;
        this.cargandoCalificacionesGuardadas = false;
      },
      error: (err) => {
        console.error('Error cargando calificaciones:', err);
        this.calificacionesGuardadas = [];
        this.cargandoCalificacionesGuardadas = false;
      }
    });
  }

  cerrarCalificacionesGuardadas(): void {
    this.mostrandoCalificacionesGuardadas = false;
    this.criterioConsulta = null;
  }

  editarNotaGuardada(calificacion: any): void {
    this.editandoNota = true;

    const datos = {
      nota: calificacion.nota,
      observaciones: calificacion.observaciones || ''
    };

    this.profesorService.editarNota(calificacion.nota_id, datos).subscribe({
      next: (response) => {
        alert('✅ Nota actualizada');
        this.editandoNota = false;
      },
      error: (err) => {
        console.error('Error editando nota:', err);
        alert('❌ Error al editar nota');
        this.editandoNota = false;
      }
    });
  }
  // ==================== PROMEDIOS ====================

  verPromedios(): void {
    this.mostrandoPromedios = true;
    this.cargarPromedios();
  }

  cargarPromedios(): void {
    this.cargandoPromedios = true;

    this.profesorService.getPromediosTrimestre(this.asignacionId, this.trimestreSeleccionado).subscribe({
      next: (data) => {
        this.promedios = data;
        this.cargandoPromedios = false;
      },
      error: (err) => {
        console.error('Error cargando promedios:', err);
        this.promedios = [];
        this.cargandoPromedios = false;
      }
    });
  }

  cerrarPromedios(): void {
    this.mostrandoPromedios = false;
  }

  getColorPromedio(promedio: number): string {
    if (promedio >= 70) return '#10b981'; // Verde
    if (promedio >= 51) return '#f59e0b'; // Naranja
    return '#ef4444'; // Rojo
  }
  getNombreTrimestre(): string {
    const trimestre = this.trimestres.find(t => t.id === this.trimestreSeleccionado);
    return trimestre ? trimestre.nombre : 'Trimestre';
  }
  // ==================== REPORTES ====================

  exportarAsistenciasExcel(): void {
    if (this.asistenciasGuardadas.length === 0) {
      alert('❌ No hay asistencias para exportar. Busca una fecha primero.');
      return;
    }

    const datos = this.asistenciasGuardadas.map(a => ({
      'Código RUDE': a.codigo_rude,
      'Apellido Paterno': a.apellido_paterno,
      'Apellido Materno': a.apellido_materno,
      'Nombre': a.nombre,
      'Estado': a.estado.toUpperCase(),
      'Observaciones': a.observaciones || ''
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');

    const filename = `Asistencias_${this.materia}_${this.grado}${this.paralelo}_${this.fechaConsulta}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  exportarCalificacionesExcel(): void {
    if (this.calificacionesGuardadas.length === 0) {
      alert('❌ No hay calificaciones para exportar.');
      return;
    }

    const datos = this.calificacionesGuardadas.map(c => ({
      'Código RUDE': c.codigo_rude,
      'Apellido Paterno': c.apellido_paterno,
      'Apellido Materno': c.apellido_materno,
      'Nombre': c.nombre,
      'Nota': c.nota,
      'Observaciones': c.observaciones || ''
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Calificaciones');

    const filename = `Calificaciones_${this.criterioConsulta.nombre}_${this.materia}_${this.grado}${this.paralelo}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  exportarPromediosExcel(): void {
    if (this.promedios.length === 0) {
      alert('❌ No hay promedios para exportar.');
      return;
    }

    const datos = this.promedios.map(p => ({
      'Código RUDE': p.codigo_rude,
      'Apellido Paterno': p.apellido_paterno,
      'Apellido Materno': p.apellido_materno,
      'Nombre': p.nombre,
      'Promedio': p.promedio,
      'Evaluaciones Completadas': `${p.notas_registradas}/${p.total_evaluaciones}`,
      'Estado': p.promedio >= 70 ? 'APROBADO' : (p.promedio >= 51 ? 'REGULAR' : 'REPROBADO')
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Promedios');

    const trimestreNombre = this.getNombreTrimestre();
    const filename = `Promedios_${trimestreNombre}_${this.materia}_${this.grado}${this.paralelo}.xlsx`;
    XLSX.writeFile(wb, filename);
  }


}
