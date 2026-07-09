import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MateriaService, Materia } from '../../services/materia.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-materia-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materia-management.html'
})
export class MateriaManagementComponent implements OnInit {
  materias: Materia[] = [];
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;

  currentMateria: Materia = {
    nombre: '',
    codigo: ''
  };

  materiaToDelete: Materia | null = null;
  showDeleteModal: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  searchText: string = '';

  get filteredMaterias(): Materia[] {
    if (!this.searchText) {
      return this.materias;
    }
    const search = this.searchText.toLowerCase();
    return this.materias.filter(m =>
      (m.nombre && m.nombre.toLowerCase().includes(search)) ||
      (m.codigo && m.codigo.toLowerCase().includes(search))
    );
  }

  constructor(private materiaService: MateriaService, private router: Router) { }

  ngOnInit(): void {
    this.loadMaterias();
  }

  loadMaterias(): void {
    this.isLoading = true;
    this.materiaService.getMaterias().subscribe({
      next: (data) => {
        this.materias = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar materias:', error);
        this.errorMessage = 'Error al cargar las materias';
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentMateria = {
      nombre: '',
      codigo: ''
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  openEditModal(materia: Materia): void {
    this.isEditMode = true;
    this.currentMateria = { ...materia };
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMateria(): void {
    if (!this.currentMateria.nombre.trim() || !this.currentMateria.codigo.trim()) {
      this.errorMessage = 'Debe completar todos los campos';
      return;
    }

    if (this.isEditMode) {
      this.materiaService.updateMateria(this.currentMateria.id!, this.currentMateria).subscribe({
        next: () => {
          this.successMessage = 'Materia actualizada exitosamente';
          this.loadMaterias();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al actualizar la materia';
        }
      });
    } else {
      this.materiaService.createMateria(this.currentMateria).subscribe({
        next: () => {
          this.successMessage = 'Materia creada exitosamente';
          this.loadMaterias();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al crear la materia';
        }
      });
    }
  }

  openDeleteModal(materia: Materia): void {
    this.materiaToDelete = materia;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.materiaToDelete = null;
  }

  confirmDelete(): void {
    if (this.materiaToDelete) {
      this.materiaService.deleteMateria(this.materiaToDelete.id!).subscribe({
        next: () => {
          this.successMessage = 'Materia eliminada exitosamente';
          this.loadMaterias();
          this.closeDeleteModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la materia';
          this.closeDeleteModal();
        }
      });
    }
  }
  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
