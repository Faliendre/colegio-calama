import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionAcademicaService, GestionAcademica } from '../../services/gestion-academica.service';
import { AlertService } from '../../services/alert.service';
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
    private router: Router,
    private alertService: AlertService
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
        this.alertService.alert(response.message, 'success');
        this.mostrarFormulario = false;
        this.cargarGestiones();
        this.limpiarFormulario();
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.alert(error.error.message || 'Error al crear gestión', 'error');
        this.isLoading = false;
      }
    });
  }

  async activarGestion(id: number): Promise<void> {
    const confirmado = await this.alertService.confirm(
      '¿Está seguro de activar esta gestión académica? Se desactivarán las demás.',
      'Activar Gestión Académica'
    );

    if (!confirmado) {
      return;
    }

    this.gestionService.activarGestion(id).subscribe({
      next: (response) => {
        this.alertService.alert(response.message, 'success');
        this.cargarGestiones();
      },
      error: (error) => {
        this.alertService.alert('Error al activar gestión', 'error');
      }
    });
  }

  async cerrarGestion(id: number): Promise<void> {
    const confirmado = await this.alertService.confirm(
      '¿Está seguro de cerrar esta gestión académica?',
      'Cerrar Gestión Académica'
    );

    if (!confirmado) {
      return;
    }

    this.gestionService.cerrarGestion(id).subscribe({
      next: (response) => {
        this.alertService.alert(response.message, 'success');
        this.cargarGestiones();
      },
      error: (error) => {
        this.alertService.alert('Error al cerrar gestión', 'error');
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
