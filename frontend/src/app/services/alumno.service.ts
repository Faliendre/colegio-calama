import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alumno {
  id?: number;
  codigo_rude: string;
  ci?: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F';
  direccion?: string;
  telefono?: string;
  activo: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private apiUrl = `${CONFIG.apiUrl}/alumnos`;
  //private apiUrl = 'http://192.168.3.57:8000/api/alumnos';

  constructor(private http: HttpClient) { }

  getAlumnos(params?: any): Observable<Alumno[]> {
    return this.http.get<Alumno[]>(this.apiUrl, { params });
  }

  getAlumno(id: number): Observable<Alumno> {
    return this.http.get<Alumno>(`${this.apiUrl}/${id}`);
  }

  createAlumno(alumno: Alumno): Observable<any> {
    return this.http.post(this.apiUrl, alumno);
  }

  updateAlumno(id: number, alumno: Alumno): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, alumno);
  }

  deleteAlumno(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
