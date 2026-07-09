import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteAsistencia {
  fechas: string[];
  reporte: {
    alumno_id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    asistencias: { [fecha: string]: string };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = `${CONFIG.apiUrl}/reporte-asistencias`;

  constructor(private http: HttpClient) {}

  getReporteAsistencias(cursoId: number, fechaInicio: string, fechaFin: string): Observable<ReporteAsistencia> {
    return this.http.get<ReporteAsistencia>(this.apiUrl, {
      params: {
        curso_id: cursoId.toString(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      }
    });
  }
}
