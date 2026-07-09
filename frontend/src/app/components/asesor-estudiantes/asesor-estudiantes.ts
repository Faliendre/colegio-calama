import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsesorService } from '../../services/asesor.service';

@Component({
  selector: 'app-asesor-estudiantes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // ← RouterLink y FormsModule agregados aquí
  templateUrl: './asesor-estudiantes.component.html',
  styleUrls: ['./asesor-estudiantes.css']
})
export class AsesorEstudiantesComponent implements OnInit {
  estudiantes: any[] = [];
  loading: boolean = true;
  searchText: string = '';

  get filteredEstudiantes(): any[] {
    if (!this.searchText) {
      return this.estudiantes;
    }
    const search = this.searchText.toLowerCase();
    return this.estudiantes.filter(e => 
      (e.nombre_completo && e.nombre_completo.toLowerCase().includes(search)) ||
      (e.nombre && e.nombre.toLowerCase().includes(search)) ||
      (e.apellido_paterno && e.apellido_paterno.toLowerCase().includes(search)) ||
      (e.apellido_materno && e.apellido_materno.toLowerCase().includes(search)) ||
      (e.codigo_rude && e.codigo_rude.toLowerCase().includes(search))
    );
  }

  constructor(
    private router: Router,
    private asesorService: AsesorService
  ) { }

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.asesorService.getEstudiantes().subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando estudiantes:', err);
        this.loading = false;
      }
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  volver(): void {
    this.router.navigate(['/asesor/dashboard']);
  }
}
