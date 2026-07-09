import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionAcademicaService, GestionAcademica } from '../../services/gestion-academica.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-academica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-academica.component.html',
  //styleUrls: ['./gestion-academica.component.css']
})
export class GestionAcademicaComponent implements OnInit {
  gestiones: GestionAcademica[] = [];
  mostrarFormulario: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  nuevaGestion = {
    anio: new Date().getFullYear(),
    fecha_inicio: '',
    fecha_fin: ''
  };

  constructor(
    private gestionService: GestionAcademicaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarGestiones();
  }

  cargarGestiones(): void {
    this.isLoading = true;
    this.gestionService.getGestiones().subscribe({
      next: (gestiones) => {
        this.gestiones = gestiones;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar gestiones académicas';
        this.isLoading = false;
      }
    });
  }

  crearGestion(): void {
    if (!this.nuevaGestion.anio || !this.nuevaGestion.fecha_inicio || !this.nuevaGestion.fecha_fin) {
      this.errorMessage = 'Complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.gestionService.crearGestion(this.nuevaGestion).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.mostrarFormulario = false;
        this.cargarGestiones();
        this.limpiarFormulario();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Error al crear gestión';
        this.isLoading = false;
      }
    });
  }

  activarGestion(id: number): void {
    if (!confirm('¿Está seguro de activar esta gestión académica? Se desactivarán las demás.')) {
      return;
    }

    this.gestionService.activarGestion(id).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.cargarGestiones();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al activar gestión';
      }
    });
  }

  cerrarGestion(id: number): void {
    if (!confirm('¿Está seguro de cerrar esta gestión académica?')) {
      return;
    }

    this.gestionService.cerrarGestion(id).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.cargarGestiones();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al cerrar gestión';
      }
    });
  }

  limpiarFormulario(): void {
    this.nuevaGestion = {
      anio: new Date().getFullYear() + 1,
      fecha_inicio: '',
      fecha_fin: ''
    };
  }

  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

}
