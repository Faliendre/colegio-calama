import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  private apiUrl = `${CONFIG.apiUrl}/promocion`;

  constructor(private http: HttpClient) { }

  obtenerElegibles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/elegibles`);
  }

  ejecutarPromocion(nuevaGestionId: number, alumnos: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/ejecutar`, {
      nueva_gestion_id: nuevaGestionId,
      alumnos: alumnos
    });
  }
}
