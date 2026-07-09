import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AsignacionProfesor {
  id?: number;
  profesor_id: number;
  profesor?: string;
  curso_id: number;
  curso?: string;
  materia_id: number;
  materia?: string;
  gestion_academica_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AsignacionProfesorService {
  private apiUrl = `${CONFIG.apiUrl}/asignaciones-profesor`;

  constructor(private http: HttpClient) {}

  getAsignaciones(params?: any): Observable<AsignacionProfesor[]> {
    return this.http.get<AsignacionProfesor[]>(this.apiUrl, { params });
  }

  getAsignacion(id: number): Observable<AsignacionProfesor> {
    return this.http.get<AsignacionProfesor>(`${this.apiUrl}/${id}`);
  }

  createAsignacion(asignacion: AsignacionProfesor): Observable<any> {
    return this.http.post(this.apiUrl, asignacion);
  }

  updateAsignacion(id: number, asignacion: AsignacionProfesor): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, asignacion);
  }

  deleteAsignacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAsignacionesPorProfesor(profesorId: number): Observable<AsignacionProfesor[]> {
    return this.http.get<AsignacionProfesor[]>(`${this.apiUrl}/por-profesor/${profesorId}`);
  }

  getAsignacionesPorCurso(cursoId: number): Observable<AsignacionProfesor[]> {
    return this.http.get<AsignacionProfesor[]>(`${this.apiUrl}/por-curso/${cursoId}`);
  }
}
