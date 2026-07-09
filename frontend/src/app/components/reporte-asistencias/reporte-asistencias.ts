import { CONFIG } from '../../config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService, ReporteAsistencia } from '../../services/asistencia.service';
import { CursoService } from '../../services/curso.service';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Router } from '@angular/router';

const pdfFontsAny: any = pdfFonts;
(pdfMake as any).vfs = pdfFontsAny.pdfMake?.vfs ?? pdfFontsAny.vfs;

@Component({
  selector: 'app-reporte-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-asistencias.html',
  styles: [`
    .presente {
      background-color: #dcfce7 !important;
      color: #166534 !important;
      font-weight: 600;
    }

    .tarde {
      background-color: #fef3c7 !important;
      color: #854d0e !important;
      font-weight: 600;
    }

    .justificado {
      background-color: #e0e7ff !important;
      color: #4338ca !important;
      font-weight: 600;
    }

    .licencia {
      background-color: #cffafe !important;
      color: #0e7490 !important;
      font-weight: 600;
    }

    .ausente {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
      font-weight: 600;
    }

    .sin-registro {
      background-color: #f3f4f6 !important;
      color: #9ca3af !important;
    }
  `]
})
export class ReporteAsistenciasComponent implements OnInit {
  cursos: any[] = [];
  gestiones: any[] = []; // ← NUEVO
  cursoSeleccionado: number | null = null;
  gestionSeleccionada: number | null = null; // ← NUEVO
  fechaInicio: string = '';
  fechaFin: string = '';

  fechas: string[] = [];
  reporte: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  searchText: string = '';

  get filteredReporte(): any[] {
    if (!this.searchText) {
      return this.reporte;
    }
    const search = this.searchText.toLowerCase();
    return this.reporte.filter(r => 
      (r.nombre_alumno && r.nombre_alumno.toLowerCase().includes(search)) ||
      (r.nombre && r.nombre.toLowerCase().includes(search)) ||
      (r.codigo_rude && r.codigo_rude.toLowerCase().includes(search))
    );
  }

  constructor(
    private asistenciaService: AsistenciaService,
    private cursoService: CursoService,
    private router: Router,
    private http: HttpClient // ← NUEVO
  ) { }

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarGestiones(); // ← NUEVO
  }

  cargarCursos(): void {
    this.isLoading = true;
    this.cursoService.getCursos().subscribe({
      next: (response: any) => {
        this.cursos = response;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar cursos:', error);
        this.errorMessage = 'Error al cargar los cursos';
        this.isLoading = false;
      }
    });
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

  // ← MÉTODO MODIFICADO
  generarReporte(): void {
    if (!this.cursoSeleccionado || !this.fechaInicio || !this.fechaFin) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Construir parámetros
    const params: any = {
      curso_id: this.cursoSeleccionado,
      fecha_inicio: this.fechaInicio,
      fecha_fin: this.fechaFin
    };

    // Agregar gestión si está seleccionada
    if (this.gestionSeleccionada) {
      params.gestion_id = this.gestionSeleccionada;
    }

    this.http.get(`${CONFIG.apiUrl}/reporte-asistencias`, { params }).subscribe({
      next: (response: any) => {
        this.fechas = response.fechas;
        this.reporte = response.reporte;
        this.successMessage = 'Reporte generado exitosamente';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        console.error('Error al generar reporte:', error);
        this.errorMessage = 'Error al generar el reporte';
        this.isLoading = false;
      }
    });
  }

  exportarPDF(): void {
    if (!this.reporte || this.reporte.length === 0) {
      this.errorMessage = 'No hay datos para exportar';
      return;
    }

    try {
      const curso = this.cursos.find(c => c.id === this.cursoSeleccionado)?.nombre || 'Curso';

      const rows: any[] = [];

      // Header con fechas
      const headerRow = [{ text: 'Alumno', bold: true }];
      this.fechas.forEach((fecha: string) => {
        headerRow.push({ text: fecha, bold: true });
      });
      rows.push(headerRow);

      // Datos de alumnos
      this.reporte.forEach((alumno: any) => {
        const fila = [{ text: alumno.nombre || '' }];
        this.fechas.forEach((fecha: string) => {
          const estado = alumno.asistencias && alumno.asistencias[fecha]
            ? alumno.asistencias[fecha]
            : '-';
          fila.push({ text: String(estado) });
        });
        rows.push(fila);
      });

      const docDefinition: any = {
        content: [
          { text: 'COLEGIO CALAMA', style: 'header' },
          { text: 'REPORTE DE ASISTENCIAS', style: 'subheader' },
          { text: `Curso: ${curso}`, margin: [0, 10, 0, 10] },
          { text: `Período: ${this.fechaInicio} al ${this.fechaFin}`, margin: [0, 0, 0, 20] },
          {
            table: {
              headerRows: 1,
              widths: Array(rows[0].length).fill('*'),
              body: rows
            }
          }
        ],
        styles: {
          header: { fontSize: 16, bold: true, alignment: 'center' },
          subheader: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 10] }
        }
      };

      (pdfMake as any).createPdf(docDefinition).download(`asistencias_${curso}_${this.fechaInicio}.pdf`);
      this.successMessage = 'PDF descargado correctamente';
      setTimeout(() => this.successMessage = '', 3000);

    } catch (error: any) {
      console.error('Error PDF:', error);
      this.errorMessage = 'Error al generar PDF';
    }
  }

  exportarExcel(): void {
    if (!this.reporte || this.reporte.length === 0) return;

    const curso = this.cursos.find(c => c.id === this.cursoSeleccionado)?.nombre || 'Curso';
    const datos: any[] = [
      [`Reporte de Asistencias - ${curso}`],
      [`Período: ${this.fechaInicio} al ${this.fechaFin}`],
      [],
      ['Alumno', ...this.fechas]
    ];

    this.reporte.forEach((alumno: any) => {
      const fila = [alumno.nombre_alumno];
      this.fechas.forEach((fecha: string) => {
        fila.push(alumno.asistencias[fecha] || '-');
      });
      datos.push(fila);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias');
    XLSX.writeFile(workbook, `asistencias_${curso}_${this.fechaInicio}.xlsx`);
    this.successMessage = 'Excel descargado';
    setTimeout(() => this.successMessage = '', 3000);
  }

  getEstadoClass(estado: string): string {
    if (!estado || estado === 'Sin registro') return 'sin-registro';

    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'presente': return 'presente';
      case 'tarde': return 'tarde';
      case 'justificado': return 'justificado';
      case 'licencia': return 'licencia';
      case 'ausente': return 'ausente';
      default: return 'sin-registro';
    }
  }

  limpiar(): void {
    this.cursoSeleccionado = null;
    this.gestionSeleccionada = null; // ← NUEVO
    this.fechaInicio = '';
    this.fechaFin = '';
    this.fechas = [];
    this.reporte = [];
    this.errorMessage = '';
  }

  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
