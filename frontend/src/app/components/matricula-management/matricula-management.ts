import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatriculaService, Matricula } from '../../services/matricula.service';
import { AlumnoService, Alumno } from '../../services/alumno.service';
import { CursoService, Curso } from '../../services/curso.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-matricula-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matricula-management.html'
})
export class MatriculaManagementComponent implements OnInit {
  matriculas: Matricula[] = [];
  alumnos: Alumno[] = [];
  cursos: Curso[] = [];

  isLoading: boolean = false;
  showModal: boolean = false;

  // Propiedades para el buscador dinámico de alumnos
  searchQuery: string = '';
  selectedAlumnoNombre: string = '';
  showAlumnoDropdown: boolean = false;
  searchText: string = '';

  get filteredMatriculas(): Matricula[] {
    if (!this.searchText) {
      return this.matriculas;
    }
    const search = this.searchText.toLowerCase();
    return this.matriculas.filter(m => 
      (m.alumno && m.alumno.toLowerCase().includes(search)) ||
      (m.curso && m.curso.toLowerCase().includes(search)) ||
      (m.estado && m.estado.toLowerCase().includes(search))
    );
  }

  currentMatricula: Matricula = {
    alumno_id: 0,
    curso_id: 0,
    gestion_academica_id: 1,
    fecha_matricula: new Date().toISOString().split('T')[0],
    estado: 'activo'
  };

  errorMessage: string = '';
  successMessage: string = '';
  selectedCurso: number = 0;

  constructor(
    private matriculaService: MatriculaService,
    private alumnoService: AlumnoService,
    private cursoService: CursoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCursos();
    this.loadAlumnos();
    this.loadMatriculas();
  }

  get filteredAlumnos(): Alumno[] {
    if (!this.searchQuery.trim()) {
      return this.alumnos;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.alumnos.filter(alumno => 
      (alumno.nombre_completo?.toLowerCase().includes(query) || 
       alumno.nombre.toLowerCase().includes(query) ||
       alumno.apellido_paterno.toLowerCase().includes(query) ||
       alumno.apellido_materno.toLowerCase().includes(query) ||
       alumno.codigo_rude.toLowerCase().includes(query) ||
       (alumno.ci && alumno.ci.toLowerCase().includes(query)))
    );
  }

  selectAlumno(alumno: Alumno): void {
    this.currentMatricula.alumno_id = alumno.id!;
    this.selectedAlumnoNombre = `${alumno.nombre_completo || (alumno.nombre + ' ' + alumno.apellido_paterno + ' ' + alumno.apellido_materno)} (RUDE: ${alumno.codigo_rude})`;
    this.searchQuery = alumno.nombre_completo || `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`;
    this.showAlumnoDropdown = false;
  }

  onSearchInput(): void {
    this.showAlumnoDropdown = true;
    // Si borra la búsqueda, deseleccionar
    if (!this.searchQuery.trim()) {
      this.currentMatricula.alumno_id = 0;
      this.selectedAlumnoNombre = '';
    }
  }

  closeAlumnoDropdownWithDelay(): void {
    setTimeout(() => {
      this.showAlumnoDropdown = false;
    }, 200);
  }


  loadCursos(): void {
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
      }
    });
  }

  loadAlumnos(): void {
    this.alumnoService.getAlumnos({ activos: 'true' }).subscribe({
      next: (data) => {
        this.alumnos = data;
      },
      error: (error) => {
        console.error('Error al cargar alumnos:', error);
      }
    });
  }

  loadMatriculas(): void {
    this.isLoading = true;
    const params = this.selectedCurso ? { curso_id: this.selectedCurso } : {};

    this.matriculaService.getMatriculas(params).subscribe({
      next: (data) => {
        this.matriculas = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar matrículas:', error);
        this.errorMessage = 'Error al cargar la lista de matrículas';
        this.isLoading = false;
      }
    });
  }

  onCursoFilterChange(): void {
    this.loadMatriculas();
  }

  openCreateModal(): void {
    this.currentMatricula = {
      alumno_id: 0,
      curso_id: 0,
      gestion_academica_id: 1,
      fecha_matricula: new Date().toISOString().split('T')[0],
      estado: 'activo'
    };
    this.searchQuery = '';
    this.selectedAlumnoNombre = '';
    this.showAlumnoDropdown = false;
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMatricula(): void {
    if (!this.currentMatricula.alumno_id || !this.currentMatricula.curso_id) {
      this.errorMessage = 'Debe seleccionar un alumno y un curso';
      return;
    }

    this.matriculaService.createMatricula(this.currentMatricula).subscribe({
      next: (response) => {
        this.successMessage = 'Matrícula registrada exitosamente';
        this.loadMatriculas();
        this.closeModal();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al registrar la matrícula';
      }
    });
  }

  cambiarEstado(matricula: Matricula, nuevoEstado: string): void {
    if (confirm(`¿Está seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      this.matriculaService.updateEstado(matricula.id!, nuevoEstado).subscribe({
        next: () => {
          this.successMessage = 'Estado actualizado exitosamente';
          this.loadMatriculas();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al actualizar el estado';
        }
      });
    }
  }

  deleteMatricula(matricula: Matricula): void {
    if (confirm(`¿Está seguro de eliminar la matrícula de ${matricula.alumno}?`)) {
      this.matriculaService.deleteMatricula(matricula.id!).subscribe({
        next: () => {
          this.successMessage = 'Matrícula eliminada exitosamente';
          this.loadMatriculas();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la matrícula';
        }
      });
    }
  }

  getEstadoBadgeColor(estado: string): string {
    switch (estado) {
      case 'activo': return 'background-color: #d1fae5; color: #065f46';
      case 'retirado': return 'background-color: #fee2e2; color: #991b1b';
      case 'trasladado': return 'background-color: #fef3c7; color: #92400e';
      default: return 'background-color: #e5e7eb; color: #374151';
    }
  }
  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
