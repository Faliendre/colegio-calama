import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Matricula {
  id?: number;
  alumno_id: number;
  alumno?: string;
  curso_id: number;
  curso?: string;
  gestion_academica_id: number;
  fecha_matricula: string;
  estado: 'activo' | 'retirado' | 'trasladado';
}

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private apiUrl = `${CONFIG.apiUrl}/matriculas`;

  constructor(private http: HttpClient) {}

  getMatriculas(params?: any): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(this.apiUrl, { params });
  }

  getMatricula(id: number): Observable<Matricula> {
    return this.http.get<Matricula>(`${this.apiUrl}/${id}`);
  }

  createMatricula(matricula: Matricula): Observable<any> {
    return this.http.post(this.apiUrl, matricula);
  }

  updateEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado });
  }

  deleteMatricula(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
