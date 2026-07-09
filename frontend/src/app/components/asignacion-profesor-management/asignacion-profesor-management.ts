import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionProfesorService, AsignacionProfesor } from '../../services/asignacion-profesor.service';
import { MateriaService, Materia } from '../../services/materia.service';
import { UserService, User } from '../../services/user.service';
import { CursoService, Curso } from '../../services/curso.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asignacion-profesor-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacion-profesor-management.html'
})
export class AsignacionProfesorManagementComponent implements OnInit {
  asignaciones: AsignacionProfesor[] = [];
  profesores: User[] = [];
  cursos: Curso[] = [];
  materias: Materia[] = [];

  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  searchText: string = '';

  get filteredAsignaciones(): AsignacionProfesor[] {
    if (!this.searchText) {
      return this.asignaciones;
    }
    const search = this.searchText.toLowerCase();
    return this.asignaciones.filter(a => 
      (a.profesor && a.profesor.toLowerCase().includes(search)) ||
      (a.materia && a.materia.toLowerCase().includes(search)) ||
      (a.curso && a.curso.toLowerCase().includes(search))
    );
  }

  currentAsignacion: AsignacionProfesor = {
    profesor_id: 0,
    curso_id: 0,
    materia_id: 0,
    gestion_academica_id: 1
  };

  asignacionToDelete: AsignacionProfesor | null = null;
  showDeleteModal: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedCurso: number = 0;

  constructor(
    private asignacionService: AsignacionProfesorService,
    private materiaService: MateriaService,
    private userService: UserService,
    private cursoService: CursoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProfesores();
    this.loadCursos();
    this.loadMaterias();
    this.loadAsignaciones();
  }

  loadProfesores(): void {
    this.userService.getUsuarios().subscribe({
      next: (data) => {
        // Filtrar solo profesores localmente
        this.profesores = data.filter(u => u.role === 'profesor');
      },
      error: (error) => console.error('Error al cargar profesores:', error)
    });
  }

  loadCursos(): void {
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
      },
      error: (error) => console.error('Error al cargar cursos:', error)
    });
  }

  loadMaterias(): void {
    this.materiaService.getMaterias().subscribe({
      next: (data) => {
        this.materias = data;
      },
      error: (error) => console.error('Error al cargar materias:', error)
    });
  }

  loadAsignaciones(): void {
    this.isLoading = true;
    const params = this.selectedCurso ? { curso_id: this.selectedCurso } : {};

    this.asignacionService.getAsignaciones(params).subscribe({
      next: (data) => {
        this.asignaciones = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
        this.errorMessage = 'Error al cargar las asignaciones';
        this.isLoading = false;
      }
    });
  }

  onCursoFilterChange(): void {
    this.loadAsignaciones();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentAsignacion = {
      profesor_id: 0,
      curso_id: 0,
      materia_id: 0,
      gestion_academica_id: 1
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  openEditModal(asignacion: AsignacionProfesor): void {
    this.isEditMode = true;
    this.currentAsignacion = { ...asignacion };
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveAsignacion(): void {
    if (!this.currentAsignacion.profesor_id || !this.currentAsignacion.curso_id || !this.currentAsignacion.materia_id) {
      this.errorMessage = 'Debe completar todos los campos';
      return;
    }

    if (this.isEditMode) {
      this.asignacionService.updateAsignacion(this.currentAsignacion.id!, this.currentAsignacion).subscribe({
        next: () => {
          this.successMessage = 'Asignación actualizada exitosamente';
          this.loadAsignaciones();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al actualizar la asignación';
        }
      });
    } else {
      this.asignacionService.createAsignacion(this.currentAsignacion).subscribe({
        next: () => {
          this.successMessage = 'Asignación creada exitosamente';
          this.loadAsignaciones();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al crear la asignación';
        }
      });
    }
  }

  openDeleteModal(asignacion: AsignacionProfesor): void {
    this.asignacionToDelete = asignacion;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.asignacionToDelete = null;
  }

  confirmDelete(): void {
    if (this.asignacionToDelete) {
      this.asignacionService.deleteAsignacion(this.asignacionToDelete.id!).subscribe({
        next: () => {
          this.successMessage = 'Asignación eliminada exitosamente';
          this.loadAsignaciones();
          this.closeDeleteModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la asignación';
          this.closeDeleteModal();
        }
      });
    }
  }
  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
