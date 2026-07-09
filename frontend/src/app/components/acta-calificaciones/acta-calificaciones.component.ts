import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActaCalificacionesService } from '../../services/acta-calificaciones.service';
import { CursoService } from '../../services/curso.service';
import { GestionAcademicaService, GestionAcademica } from '../../services/gestion-academica.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfFontsAny: any = pdfFonts;
(pdfMake as any).vfs = pdfFontsAny.pdfMake?.vfs ?? pdfFontsAny.vfs;

@Component({
  selector: 'app-acta-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acta-calificaciones.component.html',
  //styleUrls: ['./acta-calificaciones.component.css']
})
export class ActaCalificacionesComponent implements OnInit {
  cursos: any[] = [];
  gestiones: GestionAcademica[] = [];
  cursoSeleccionado: number | null = null;
  gestionSeleccionada: number | null = null;

  actaData: any = null;
  materias: string[] = [];
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
      (a.codigo_rude && a.codigo_rude.toLowerCase().includes(search))
    );
  }

  constructor(
    private actaService: ActaCalificacionesService,
    private cursoService: CursoService,
    private gestionService: GestionAcademicaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarGestiones();
  }

  cargarCursos(): void {
    this.cursoService.getCursos().subscribe({
      next: (response: any) => {
        this.cursos = response;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar cursos';
      }
    });
  }

  cargarGestiones(): void {
    this.gestionService.getGestiones().subscribe({
      next: (gestiones) => {
        this.gestiones = gestiones;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar gestiones';
      }
    });
  }

  generarActa(): void {
    if (!this.cursoSeleccionado || !this.gestionSeleccionada) {
      this.errorMessage = 'Seleccione curso y gestión';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.actaData = null;

    this.actaService.generarActa(this.cursoSeleccionado, this.gestionSeleccionada).subscribe({
      next: (response) => {
        this.actaData = response;
        this.materias = response.materias;
        this.alumnos = response.acta;
        this.successMessage = 'Acta generada exitosamente';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error.error || 'Error al generar acta';
        this.isLoading = false;
      }
    });
  }

  exportarPDF(): void {
    if (!this.actaData) return;

    const curso = this.actaData.curso;
    const tableBody: any[] = [];

    // Header
    const headerRow = ['N°', 'Alumno'];
    this.materias.forEach(materia => {
      headerRow.push(`${materia}\nT1`, `${materia}\nT2`, `${materia}\nT3`, `${materia}\nProm`);
    });
    headerRow.push('Promedio\nGeneral', 'Estado');
    tableBody.push(headerRow.map(h => ({ text: h, bold: true, fontSize: 8 })));

    // Datos
    this.alumnos.forEach((alumno, index) => {
      const row: any[] = [
        { text: (index + 1).toString(), fontSize: 8 },
        { text: alumno.nombre_completo, fontSize: 8 }
      ];

      alumno.calificaciones.forEach((cal: any) => {
        row.push(
          { text: cal.t1.toFixed(2), fontSize: 8 },
          { text: cal.t2.toFixed(2), fontSize: 8 },
          { text: cal.t3.toFixed(2), fontSize: 8 },
          { text: cal.promedio.toFixed(2), fontSize: 8, bold: true }
        );
      });

      row.push(
        { text: alumno.promedio_general.toFixed(2), fontSize: 8, bold: true },
        {
          text: alumno.estado,
          fontSize: 8,
          color: alumno.estado === 'Aprobado' ? 'green' : 'red',
          bold: true
        }
      );

      tableBody.push(row);
    });

    const docDefinition: any = {
      pageOrientation: 'landscape',
      pageSize: 'LEGAL',
      content: [
        { text: 'COLEGIO NACIONAL CALAMA', style: 'header' },
        { text: 'ACTA DE CALIFICACIONES', style: 'subheader' },
        { text: `Curso: ${curso.grado} "${curso.paralelo}"`, margin: [0, 5, 0, 5] },
        { text: `Total Alumnos: ${this.actaData.total_alumnos} | Aprobados: ${this.actaData.aprobados} | Reprobados: ${this.actaData.reprobados}`, margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', ...Array(this.materias.length * 4 + 2).fill('auto')],
            body: tableBody
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center' },
        subheader: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 10] }
      }
    };

    (pdfMake as any).createPdf(docDefinition).download(`acta_${curso.grado}_${curso.paralelo}.pdf`);
    this.successMessage = 'PDF descargado';
    setTimeout(() => this.successMessage = '', 3000);
  }

  exportarExcel(): void {
    if (!this.actaData) return;

    const curso = this.actaData.curso;
    const datos: any[] = [
      [`Acta de Calificaciones - ${curso.grado} "${curso.paralelo}"`],
      [],
      ['N°', 'Alumno']
    ];

    // Headers de materias
    this.materias.forEach(materia => {
      datos[2].push(`${materia} T1`, `${materia} T2`, `${materia} T3`, `${materia} Prom`);
    });
    datos[2].push('Promedio General', 'Estado');

    // Datos de alumnos
    this.alumnos.forEach((alumno, index) => {
      const fila = [index + 1, alumno.nombre_completo];

      alumno.calificaciones.forEach((cal: any) => {
        fila.push(cal.t1, cal.t2, cal.t3, cal.promedio);
      });

      fila.push(alumno.promedio_general, alumno.estado);
      datos.push(fila);
    });

    // Resumen
    datos.push([]);
    datos.push(['Total Alumnos:', this.actaData.total_alumnos]);
    datos.push(['Aprobados:', this.actaData.aprobados]);
    datos.push(['Reprobados:', this.actaData.reprobados]);

    const worksheet = XLSX.utils.aoa_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Acta');
    XLSX.writeFile(workbook, `acta_${curso.grado}_${curso.paralelo}.xlsx`);

    this.successMessage = 'Excel descargado';
    setTimeout(() => this.successMessage = '', 3000);
  }

  limpiar(): void {
    this.cursoSeleccionado = null;
    this.gestionSeleccionada = null;
    this.actaData = null;
    this.materias = [];
    this.alumnos = [];
    this.errorMessage = '';
  }

  volverAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
