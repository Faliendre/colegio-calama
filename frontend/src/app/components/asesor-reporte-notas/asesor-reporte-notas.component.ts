import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AsesorService } from '../../services/asesor.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-asesor-reporte-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asesor-reporte-notas.component.html',
  styleUrls: ['./asesor-reporte-notas.css']
})
export class AsesorReporteNotasComponent implements OnInit {
  trimestres: any[] = [];
  trimestreSeleccionado: number = 1;
  materias: any[] = [];
  reporte: any[] = [];
  loading: boolean = true;
  searchText: string = '';

  get filteredReporte(): any[] {
    if (!this.searchText) {
      return this.reporte;
    }
    const search = this.searchText.toLowerCase();
    return this.reporte.filter(r => 
      (r.nombre && r.nombre.toLowerCase().includes(search)) ||
      (r.apellido_paterno && r.apellido_paterno.toLowerCase().includes(search)) ||
      (r.apellido_materno && r.apellido_materno.toLowerCase().includes(search)) ||
      (r.codigo_rude && r.codigo_rude.toLowerCase().includes(search))
    );
  }

  constructor(
    private router: Router,
    private asesorService: AsesorService
  ) { }

  ngOnInit(): void {
    this.cargarTrimestres();
  }

  cargarTrimestres(): void {
    this.asesorService.getTrimestres().subscribe({
      next: (data) => {
        this.trimestres = data.map(t => ({
          id: t.id,
          nombre: `Trimestre ${t.numero}`
        }));
        if (data.length > 0) {
          this.trimestreSeleccionado = data[0].id;
          this.cargarReporte();
        }
      },
      error: (err) => {
        console.error('Error cargando trimestres:', err);
        this.loading = false;
      }
    });
  }

  cargarReporte(): void {
    this.loading = true;

    this.asesorService.getReporteNotas(this.trimestreSeleccionado).subscribe({
      next: (data) => {
        this.materias = data.materias;
        this.reporte = data.reporte;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando reporte:', err);
        this.loading = false;
      }
    });
  }

  cambiarTrimestre(trimestreId: number): void {
    this.trimestreSeleccionado = trimestreId;
    this.cargarReporte();
  }

  getColorNota(nota: number | null): string {
    if (nota === null) return '#9ca3af';
    if (nota >= 70) return '#10b981';
    if (nota >= 51) return '#f59e0b';
    return '#ef4444';
  }

  exportarExcel(): void {
    if (this.reporte.length === 0) {
      alert('❌ No hay datos para exportar');
      return;
    }

    const datos = this.reporte.map(alumno => {
      const fila: any = {
        'Código RUDE': alumno.codigo_rude,
        'Apellido Paterno': alumno.apellido_paterno,
        'Apellido Materno': alumno.apellido_materno,
        'Nombre': alumno.nombre
      };

      alumno.notas_por_materia.forEach((materia: any) => {
        fila[materia.materia_nombre] = materia.promedio !== null ? materia.promedio : 'S/N';
      });

      fila['Promedio General'] = alumno.promedio_general;

      return fila;
    });

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Notas');

    const trimestreNombre = this.trimestres.find(t => t.id === this.trimestreSeleccionado)?.nombre || 'Trimestre';
    const filename = `Reporte_Notas_${trimestreNombre}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  volver(): void {
    this.router.navigate(['/asesor/dashboard']);
  }
}
