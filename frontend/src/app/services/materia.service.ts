import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Materia {
  id?: number;
  nombre: string;
  codigo: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MateriaService {
  private apiUrl = `${CONFIG.apiUrl}/materias`;

  constructor(private http: HttpClient) {}

  getMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(this.apiUrl);
  }

  getMateria(id: number): Observable<Materia> {
    return this.http.get<Materia>(`${this.apiUrl}/${id}`);
  }

  createMateria(materia: Materia): Observable<any> {
    return this.http.post(this.apiUrl, materia);
  }

  updateMateria(id: number, materia: Materia): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, materia);
  }

  deleteMateria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
