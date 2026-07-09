import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsesorService {
  private apiUrl = `${CONFIG.apiUrl}/asesor`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { headers: this.getHeaders() });
  }

  getEstudiantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estudiantes`, { headers: this.getHeaders() });
  }

  getTrimestres(): Observable<any[]> {
    return this.http.get<any[]>(`${CONFIG.apiUrl}/profesor/trimestres`, { headers: this.getHeaders() });
  }

  getReporteNotas(trimestreId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reporte-notas?trimestre_id=${trimestreId}`, { headers: this.getHeaders() });
  }

  getReporteAsistencia(fechaInicio?: string, fechaFin?: string): Observable<any[]> {
    let url = `${this.apiUrl}/reporte-asistencia`;

    if (fechaInicio && fechaFin) {
      url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    }

    return this.http.get<any[]>(url, { headers: this.getHeaders() });
  }

  getFichaEstudiante(alumnoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estudiante/${alumnoId}`, { headers: this.getHeaders() });
  }
}
