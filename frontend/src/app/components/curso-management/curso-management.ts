import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursoService, Curso } from '../../services/curso.service';
import { UserService, User } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-curso-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './curso-management.html'
})
export class CursoManagementComponent implements OnInit {
  cursos: Curso[] = [];
  asesores: User[] = [];
  isLoading: boolean = false;
  showModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  searchText: string = '';

  get filteredCursos(): Curso[] {
    if (!this.searchText) {
      return this.cursos;
    }
    const search = this.searchText.toLowerCase();
    return this.cursos.filter(c => 
      (c.grado && String(c.grado).toLowerCase().includes(search)) ||
      (c.paralelo && c.paralelo.toLowerCase().includes(search)) ||
      (c.asesor && c.asesor.toLowerCase().includes(search))
    );
  }

  currentCurso: Curso = {
    grado: '1',
    paralelo: 'A',
    capacidad_maxima: 45,
    gestion_academica_id: 1,
    asesor_id: null
  };
  compareFn(a: any, b: any): boolean {
    return a === b;
  }

  cursoToDelete: Curso | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  // Opciones para los selects
  grados = [
    { valor: 1, texto: 'Primero' },
    { valor: 2, texto: 'Segundo' },
    { valor: 3, texto: 'Tercero' },
    { valor: 4, texto: 'Cuarto' },
    { valor: 5, texto: 'Quinto' },
    { valor: 6, texto: 'Sexto' }
  ];
  paralelos = ['A', 'B', 'C', 'D', 'E'];

  constructor(
    private cursoService: CursoService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAsesores();
    this.loadCursos();
  }

  loadAsesores(): void {
    this.userService.getUsuarios().subscribe({
      next: (data) => {
        // Filtrar solo asesores
        this.asesores = data.filter(u => u.role === 'asesor');
      },
      error: (error) => console.error('Error al cargar asesores:', error)
    });
  }

  loadCursos(): void {
    this.isLoading = true;
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.errorMessage = 'Error al cargar la lista de cursos';
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentCurso = {
      grado: null,
      paralelo: 'A',
      capacidad_maxima: 45,
      gestion_academica_id: 1,
      asesor_id: null
    };
    this.showModal = true;
    this.errorMessage = '';
  }


  openEditModal(curso: Curso): void {
    this.isEditMode = true;
    this.currentCurso = {
      ...curso,
      grado: String(curso.grado)  // ← CONVERTIR A STRING
    };
    this.showModal = true;
    this.errorMessage = '';
  }






  closeModal(): void {
    this.showModal = false;

  }

  saveCurso(): void {
    if (this.isEditMode) {
      this.cursoService.updateCurso(this.currentCurso.id!, this.currentCurso).subscribe({
        next: (response) => {
          this.successMessage = 'Curso actualizado exitosamente';
          this.loadCursos();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al actualizar el curso';
        }
      });
    } else {
      this.cursoService.createCurso(this.currentCurso).subscribe({
        next: (response) => {
          this.successMessage = 'Curso creado exitosamente';
          this.loadCursos();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al crear el curso';
        }
      });
    }
  }

  openDeleteModal(curso: Curso): void {
    this.cursoToDelete = curso;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.cursoToDelete = null;
  }

  confirmDelete(): void {
    if (this.cursoToDelete) {
      this.cursoService.deleteCurso(this.cursoToDelete.id!).subscribe({
        next: () => {
          this.successMessage = 'Curso eliminado exitosamente';
          this.loadCursos();
          this.closeDeleteModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al eliminar el curso';
          this.closeDeleteModal();
        }
      });
    }
  }

  getCupoColor(curso: Curso): string {
    const porcentaje = ((curso.estudiantes_inscritos || 0) / curso.capacidad_maxima) * 100;
    if (porcentaje >= 90) return 'text-red-600';
    if (porcentaje >= 70) return 'text-yellow-600';
    return 'text-green-600';
  }

  getAsesorNombre(asesorId: number | null | undefined): string {
    if (!asesorId) return 'Sin asesor';
    const asesor = this.asesores.find(a => a.id === asesorId);
    return asesor ? asesor.name : 'Sin asesor';
  }
  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
