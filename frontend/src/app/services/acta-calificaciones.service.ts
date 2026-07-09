import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActaCalificacionesService {
  private apiUrl = `${CONFIG.apiUrl}/acta-calificaciones`;

  constructor(private http: HttpClient) { }

  generarActa(cursoId: number, gestionId: number): Observable<any> {
    return this.http.post(this.apiUrl, {
      curso_id: cursoId,
      gestion_id: gestionId
    });
  }
}
