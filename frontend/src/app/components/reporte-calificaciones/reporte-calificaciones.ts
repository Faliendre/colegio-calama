import { CONFIG } from '../../config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalificacionesService } from '../../services/calificaciones.service';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Router } from '@angular/router';

const pdfFontsAny: any = pdfFonts;
(pdfMake as any).vfs = pdfFontsAny.pdfMake?.vfs ?? pdfFontsAny.vfs;

@Component({
  selector: 'app-reporte-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-calificaciones.html',
  styleUrls: ['./reporte-calificaciones.css']
})
export class ReporteCalificacionesComponent implements OnInit {
  alumnos: any[] = [];
  gestiones: any[] = []; // ← NUEVO
  alumnoSeleccionado: number | null = null;
  gestionSeleccionada: number | null = null; // ← NUEVO
  reporteData: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private calificacionesService: CalificacionesService,
    private router: Router,
    private http: HttpClient // ← NUEVO
  ) { }

  ngOnInit(): void {
    this.cargarAlumnos();
    this.cargarGestiones(); // ← NUEVO
  }

  cargarAlumnos(): void {
    this.isLoading = true;
    this.calificacionesService.getAlumnos().subscribe(
      (response: any) => {
        this.alumnos = response;
        this.isLoading = false;
      },
      (error: any) => {
        this.errorMessage = 'Error al cargar alumnos';
        this.isLoading = false;
      }
    );
  }

  // ← NUEVO MÉTODO
  cargarGestiones(): void {
    this.http.get(`${CONFIG.apiUrl}/gestiones-academicas`).subscribe({
      next: (response: any) => {
        this.gestiones = response;
      },
      error: (error) => {
        console.error('Error al cargar gestiones:', error);
      }
    });
  }

  generarReporte(): void {
    if (!this.alumnoSeleccionado) {
      this.errorMessage = 'Seleccione un alumno';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.calificacionesService.getReporteCalificaciones(
      this.alumnoSeleccionado,
      this.gestionSeleccionada || undefined
    ).subscribe({
      next: (response: any) => {
        this.reporteData = response;
        this.successMessage = 'Reporte generado';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.errorMessage = 'Error al generar reporte';
        this.isLoading = false;
      }
    });
  }


  exportarPDF(): void {
    if (!this.reporteData) return;

    const alumno = this.reporteData.alumno;
    const materias = this.reporteData.materias;

    const tableBody: any[] = [
      ['Materia', 'T1', 'T2', 'T3', 'Promedio']
    ];

    materias.forEach((materia: any) => {
      const prom = this.calcularPromedio(materia.trimestres);
      tableBody.push([
        materia.nombre,
        (materia.trimestres[0] || 0).toFixed(2),
        (materia.trimestres[1] || 0).toFixed(2),
        (materia.trimestres[2] || 0).toFixed(2),
        prom.toFixed(2)
      ]);
    });

    const docDefinition: any = {
      content: [
        { text: 'COLEGIO CALAMA', style: 'header' },
        { text: 'BOLETÍN DE CALIFICACIONES', style: 'subheader' },
        { text: `Alumno: ${alumno.nombre} ${alumno.apellido_paterno}`, margin: [0, 10, 0, 20] },
        { table: { headerRows: 1, body: tableBody } }
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center' },
        subheader: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 10] }
      }
    };

    (pdfMake as any).createPdf(docDefinition).download(`boletín_${alumno.nombre}.pdf`);
    this.successMessage = 'PDF descargado';
    setTimeout(() => this.successMessage = '', 3000);
  }

  exportarExcel(): void {
    if (!this.reporteData) return;

    const alumno = this.reporteData.alumno;
    const materias = this.reporteData.materias;

    const datos: any[] = [
      [`Boletín de ${alumno.nombre}`],
      [],
      ['Materia', 'Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Promedio']
    ];

    materias.forEach((materia: any) => {
      const prom = this.calcularPromedio(materia.trimestres);
      datos.push([
        materia.nombre,
        materia.trimestres[0] || 0,
        materia.trimestres[1] || 0,
        materia.trimestres[2] || 0,
        prom.toFixed(2)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Calificaciones');
    XLSX.writeFile(workbook, `boletín_${alumno.nombre}.xlsx`);
    this.successMessage = 'Excel descargado';
    setTimeout(() => this.successMessage = '', 3000);
  }

  calcularPromedio(trimestres: number[]): number {
    if (!trimestres || trimestres.length === 0) return 0;
    return trimestres.reduce((a, b) => a + b, 0) / trimestres.length;
  }

  limpiar(): void {
    this.alumnoSeleccionado = null;
    this.gestionSeleccionada = null;
    this.reporteData = null;
  }
  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
