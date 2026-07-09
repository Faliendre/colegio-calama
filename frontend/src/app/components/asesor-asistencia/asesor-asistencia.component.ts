import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AsesorService } from '../../services/asesor.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-asesor-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asesor-asistencia.component.html',
  styleUrls: ['./asesor-asistencia.css']
})
export class AsesorAsistenciaComponent implements OnInit {
  reporte: any[] = [];
  loading: boolean = true;

  // Filtros de fecha
  fechaInicio: string = '';
  fechaFin: string = '';
  usarFiltro: boolean = false;
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
    // Establecer fechas del mes actual
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    this.fechaInicio = primerDia.toISOString().split('T')[0];
    this.fechaFin = ultimoDia.toISOString().split('T')[0];

    this.cargarReporte();
  }

  cargarReporte(): void {
    this.loading = true;

    const fechaIni = this.usarFiltro ? this.fechaInicio : undefined;
    const fechaFi = this.usarFiltro ? this.fechaFin : undefined;

    this.asesorService.getReporteAsistencia(fechaIni, fechaFi).subscribe({
      next: (data) => {
        this.reporte = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando reporte:', err);
        this.loading = false;
      }
    });
  }

  aplicarFiltro(): void {
    this.usarFiltro = true;
    this.cargarReporte();
  }

  limpiarFiltro(): void {
    this.usarFiltro = false;
    this.cargarReporte();
  }

  getColorPorcentaje(porcentaje: number): string {
    if (porcentaje >= 90) return '#10b981';
    if (porcentaje >= 75) return '#3b82f6';
    if (porcentaje >= 60) return '#f59e0b';
    return '#ef4444';
  }

  getEstadoTexto(porcentaje: number): string {
    if (porcentaje >= 90) return 'Excelente';
    if (porcentaje >= 75) return 'Bueno';
    if (porcentaje >= 60) return 'Regular';
    return 'Crítico';
  }

  exportarExcel(): void {
    if (this.reporte.length === 0) {
      alert('❌ No hay datos para exportar');
      return;
    }

    const datos = this.reporte.map(alumno => ({
      'Código RUDE': alumno.codigo_rude,
      'Apellido Paterno': alumno.apellido_paterno,
      'Apellido Materno': alumno.apellido_materno,
      'Nombre': alumno.nombre,
      'Presente': alumno.presente,
      'Ausente': alumno.ausente,
      'Licencia': alumno.licencia,
      'Total Registros': alumno.total_registros,
      'Porcentaje Asistencia': alumno.porcentaje_asistencia + '%',
      'Estado': this.getEstadoTexto(alumno.porcentaje_asistencia)
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Asistencia');

    const filename = `Reporte_Asistencia_${this.fechaInicio}_${this.fechaFin}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  volver(): void {
    this.router.navigate(['/asesor/dashboard']);
  }
}
