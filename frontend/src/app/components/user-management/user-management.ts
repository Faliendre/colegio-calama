import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = false;
  showModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  searchText: string = '';

  get filteredUsers(): User[] {
    if (!this.searchText) {
      return this.users;
    }
    const search = this.searchText.toLowerCase();
    return this.users.filter(u => 
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.username && u.username.toLowerCase().includes(search)) ||
      (u.apellido_paterno && u.apellido_paterno.toLowerCase().includes(search)) ||
      (u.apellido_materno && u.apellido_materno.toLowerCase().includes(search)) ||
      (u.role && u.role.toLowerCase().includes(search))
    );
  }

  currentUser: User = {
    username: '',
    name: '',
    apellido_paterno: '',  // ← Nuevo
    apellido_materno: '',  // ← Nuevo
    role: 'profesor',
    password: ''
  };

  userToDelete: User | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    console.log('UserManagementComponent cargado');
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        console.log('Usuarios cargados:', data);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.errorMessage = 'Error al cargar la lista de usuarios';
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentUser = {
      username: '',
      name: '',
      apellido_paterno: '',
      apellido_materno: '',
      role: 'profesor',
      password: ''
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.currentUser = {
      id: user.id,
      username: user.username || '',
      name: user.name || '',
      apellido_paterno: user.apellido_paterno || '',
      apellido_materno: user.apellido_materno || '',
      role: user.role || 'profesor',
      password: ''
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUser = {
      username: '',
      name: '',
      apellido_paterno: '',
      apellido_materno: '',
      role: 'profesor',
      password: ''
    };
  }

  saveUser(): void {
    if (this.isEditMode) {
      this.userService.updateUser(this.currentUser.id!, this.currentUser).subscribe({
        next: (response) => {
          this.successMessage = 'Usuario actualizado exitosamente';
          this.loadUsers();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al actualizar el usuario';
        }
      });
    } else {
      this.userService.createUser(this.currentUser).subscribe({
        next: (response) => {
          this.successMessage = 'Usuario creado exitosamente';
          this.loadUsers();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al crear el usuario';
        }
      });
    }
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id!).subscribe({
        next: () => {
          this.successMessage = 'Usuario eliminado exitosamente';
          this.loadUsers();
          this.closeDeleteModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el usuario';
          this.closeDeleteModal();
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    const classes: any = {
      'administrador': 'bg-blue-100 text-blue-800',
      'profesor': 'bg-green-100 text-green-800',
      'asesor': 'bg-purple-100 text-purple-800',
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      'administrador': 'Administrador',
      'profesor': 'Profesor',
      'asesor': 'Asesor',
    };
    return labels[role] || role;
  }
  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
