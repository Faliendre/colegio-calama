import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalificacionesService {
  private apiUrl = `${CONFIG.apiUrl}/calificaciones`;

  constructor(private http: HttpClient) { }

  getAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alumnos`);
  }

  getReporteCalificaciones(alumnoId: number, gestionId?: number): Observable<any> {
    const params: any = {};
    if (gestionId) {
      params.gestion_id = gestionId;
    }
    return this.http.get<any>(`${this.apiUrl}/reporte/${alumnoId}`, { params });
  }

  exportarPDF(alumnoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${alumnoId}/pdf`, { responseType: 'blob' });
  }

  exportarExcel(alumnoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${alumnoId}/excel`, { responseType: 'blob' });
  }
}
