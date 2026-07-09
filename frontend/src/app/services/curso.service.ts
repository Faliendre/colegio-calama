import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Curso {
  id?: number;
  grado: string | null;
  paralelo: string;
  nombre_completo?: string;
  capacidad_maxima: number;
  estudiantes_inscritos?: number;
  asesor?: string;
  asesor_id?: number | null;
  gestion_academica_id: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = `${CONFIG.apiUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  getCurso(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  createCurso(curso: Curso): Observable<any> {
    return this.http.post(this.apiUrl, curso);
  }

  updateCurso(id: number, curso: Curso): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, curso);
  }

  deleteCurso(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
