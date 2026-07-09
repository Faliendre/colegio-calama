import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
interface DashboardStats {
  cursos_asignados: number;
  total_alumnos: number;
  asistencias_hoy: number;
  recent_activity?: any[];
}

interface Curso {
  curso_id: number;
  grado: string;
  paralelo: string;
  materia: string;
  materia_id: number;
  asignacion_id: number;
  total_alumnos: number;
}

interface Alumno {
  id: number;
  codigo_rude: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  matricula_id: number;
}

interface AsistenciaRegistro {
  asignacion_profesor_id: number;
  fecha: string;
  asistencias: Array<{
    alumno_id: number;
    estado: string;
    observaciones?: string;
  }>;
}

interface CriterioEvaluacion {
  asignacion_profesor_id: number;
  trimestre_id: number;
  nombre: string;
  ponderacion: number;
}

interface CalificacionRegistro {
  criterio_evaluacion_id: number;
  calificaciones: Array<{
    alumno_id: number;
    nota: number;
    observaciones?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
  private apiUrl = `${CONFIG.apiUrl}/profesor`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`, { headers: this.getHeaders() });
  }

  getMisCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}/mis-cursos`, { headers: this.getHeaders() });
  }

  getAlumnosPorCurso(cursoId: number): Observable<Alumno[]> {
    return this.http.get<Alumno[]>(`${this.apiUrl}/curso/${cursoId}/alumnos`, { headers: this.getHeaders() });
  }

  registrarAsistencia(asistenciaData: AsistenciaRegistro): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/asistencia/registrar`, asistenciaData, { headers: this.getHeaders() });
  }

  verAsistencia(cursoId: number, fecha: string, asignacionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asistencia/curso/${cursoId}?fecha=${fecha}&asignacion_id=${asignacionId}`, { headers: this.getHeaders() });
  }

  crearCriterio(criterioData: CriterioEvaluacion): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criterio/crear`, criterioData, { headers: this.getHeaders() });
  }

  registrarCalificaciones(calificacionData: CalificacionRegistro): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/calificaciones/registrar`, calificacionData, { headers: this.getHeaders() });
  }

  verCalificaciones(cursoId: number, trimestreId: number, asignacionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/calificaciones/curso/${cursoId}?trimestre_id=${trimestreId}&asignacion_id=${asignacionId}`, { headers: this.getHeaders() });
  }
  getTrimestres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/trimestres`, { headers: this.getHeaders() });
  }

  getCriterios(asignacionId: number, trimestreId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/criterios?asignacion_id=${asignacionId}&trimestre_id=${trimestreId}`, { headers: this.getHeaders() });
  }
  getAsistenciasPorFecha(asignacionId: number, fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asistencia?asignacion_id=${asignacionId}&fecha=${fecha}`, { headers: this.getHeaders() });
  }

  editarAsistencia(asistenciaId: number, editData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/asistencia/${asistenciaId}`, editData, { headers: this.getHeaders() });
  }
  getCalificacionesPorCriterio(criterioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/calificaciones?criterio_id=${criterioId}`, { headers: this.getHeaders() });
  }

  editarNota(notaId: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/nota/${notaId}`, datos, { headers: this.getHeaders() });
  }

  getPromediosTrimestre(asignacionId: number, trimestreId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promedios?asignacion_id=${asignacionId}&trimestre_id=${trimestreId}`, { headers: this.getHeaders() });
  }


}
