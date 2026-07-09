import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GestionAcademica {
  id: number;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GestionAcademicaService {
  private apiUrl = `${CONFIG.apiUrl}/gestiones-academicas`;

  constructor(private http: HttpClient) { }

  getGestiones(): Observable<GestionAcademica[]> {
    return this.http.get<GestionAcademica[]>(this.apiUrl);
  }

  crearGestion(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  activarGestion(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/activar`, {});
  }

  cerrarGestion(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cerrar`, {});
  }

  getGestionActiva(): Observable<GestionAcademica> {
    return this.http.get<GestionAcademica>(`${this.apiUrl}/activa`);
  }
}
