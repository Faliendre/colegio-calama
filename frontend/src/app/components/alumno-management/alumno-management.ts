import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlumnoService, Alumno } from '../../services/alumno.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alumno-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alumno-management.html'
})

export class AlumnoManagementComponent implements OnInit {
  alumnos: Alumno[] = [];
  isLoading: boolean = false;
  showModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;

  currentAlumno: Alumno = {
    codigo_rude: '',
    ci: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    genero: 'M',
    direccion: '',
    telefono: '',
    activo: true
  };

  alumnoToDelete: Alumno | null = null;
  errorMessage: string = '';
  successMessage: string = '';
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
      (a.codigo_rude && a.codigo_rude.toLowerCase().includes(search)) ||
      (a.ci && a.ci.toLowerCase().includes(search)) ||
      (a.nombre_completo && a.nombre_completo.toLowerCase().includes(search))
    );
  }

  constructor(private alumnoService: AlumnoService, private router: Router) { }


  ngOnInit(): void {
    this.loadAlumnos();
  }

  loadAlumnos(): void {
    this.isLoading = true;
    this.alumnoService.getAlumnos().subscribe({
      next: (data) => {
        this.alumnos = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar alumnos:', error);
        this.errorMessage = 'Error al cargar la lista de alumnos';
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentAlumno = {
      codigo_rude: '',
      ci: '',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      genero: 'M',
      direccion: '',
      telefono: '',
      activo: true
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  openEditModal(alumno: Alumno): void {
    this.isEditMode = true;
    this.currentAlumno = { ...alumno };
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveAlumno(): void {
    if (this.isEditMode) {
      this.alumnoService.updateAlumno(this.currentAlumno.id!, this.currentAlumno).subscribe({
        next: (response) => {
          this.successMessage = 'Alumno actualizado exitosamente';
          this.loadAlumnos();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al actualizar el alumno';
        }
      });
    } else {
      this.alumnoService.createAlumno(this.currentAlumno).subscribe({
        next: (response) => {
          this.successMessage = 'Alumno registrado exitosamente';
          this.loadAlumnos();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al registrar el alumno';
        }
      });
    }
  }

  openDeleteModal(alumno: Alumno): void {
    this.alumnoToDelete = alumno;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.alumnoToDelete = null;
  }

  confirmDelete(): void {
    if (this.alumnoToDelete) {
      this.alumnoService.deleteAlumno(this.alumnoToDelete.id!).subscribe({
        next: () => {
          this.successMessage = 'Alumno desactivado exitosamente';
          this.loadAlumnos();
          this.closeDeleteModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al desactivar el alumno';
          this.closeDeleteModal();
        }
      });
    }
  }

  getGeneroLabel(genero: string): string {
    return genero === 'M' ? 'Masculino' : 'Femenino';
  }

  getEstadoBadge(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  getEstadoColor(activo: boolean): string {
    return activo ? 'background-color: #d1fae5; color: #065f46' : 'background-color: #fee2e2; color: #991b1b';
  }
  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
