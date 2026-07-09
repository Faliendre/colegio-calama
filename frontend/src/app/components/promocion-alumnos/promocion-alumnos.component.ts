import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromocionService } from '../../services/promocion.service';
import { GestionAcademicaService, GestionAcademica } from '../../services/gestion-academica.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-promocion-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promocion-alumnos.component.html',
  //styleUrls: ['./promocion-alumnos.component.css']
})
export class PromocionAlumnosComponent implements OnInit {
  gestionActual: any = null;
  gestiones: GestionAcademica[] = [];
  gestionSeleccionada: number | null = null;
  alumnos: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  searchText: string = '';

  get filteredAlumnos(): any[] {
    if (!this.searchText) {
      return this.alumnos;
    }
    const search = this.searchText.toLowerCase();
    return this.alumnos.filter(a => 
      (a.nombre_completo && a.nombre_completo.toLowerCase().includes(search)) ||
      (a.codigo_rude && a.codigo_rude.toLowerCase().includes(search)) ||
      (a.curso_actual && a.curso_actual.toLowerCase().includes(search))
    );
  }

  // Estadísticas
  totalAlumnos: number = 0;
  aprobados: number = 0;
  reprobados: number = 0;

  constructor(
    private promocionService: PromocionService,
    private gestionService: GestionAcademicaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarGestiones();
    this.cargarAlumnos();
  }

  cargarGestiones(): void {
    this.gestionService.getGestiones().subscribe({
      next: (gestiones) => {
        this.gestiones = gestiones.filter(g => !g.activo); // Solo inactivas
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar gestiones';
      }
    });
  }

  cargarAlumnos(): void {
    this.isLoading = true;
    this.promocionService.obtenerElegibles().subscribe({
      next: (response) => {
        this.gestionActual = response.gestion_actual;
        this.alumnos = response.alumnos;
        this.calcularEstadisticas();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar alumnos elegibles';
        this.isLoading = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalAlumnos = this.alumnos.length;
    this.aprobados = this.alumnos.filter(a => a.aprobado).length;
    this.reprobados = this.totalAlumnos - this.aprobados;
  }

  ejecutarPromocion(): void {
    if (!this.gestionSeleccionada) {
      this.errorMessage = 'Seleccione la gestión de destino';
      return;
    }

    if (!confirm(`¿Está seguro de promover ${this.aprobados} alumnos y repetir ${this.reprobados} alumnos a la gestión seleccionada?`)) {
      return;
    }

    this.isLoading = true;
    this.promocionService.ejecutarPromocion(this.gestionSeleccionada, this.alumnos).subscribe({
      next: (response) => {
        this.successMessage = `Promoción exitosa: ${response.promocionados} promocionados, ${response.repetidores} repetidores`;
        setTimeout(() => {
          this.router.navigate(['/admin/gestion-academica']);
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al ejecutar promoción';
        this.isLoading = false;
      }
    });
  }

  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
