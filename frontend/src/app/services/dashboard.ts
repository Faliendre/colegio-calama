import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  total_users: number;
  students: number;
  teachers: number;
  active_courses: number;  // ← Cambio: debe coincidir con el backend
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${CONFIG.apiUrl}/dashboard`;
  //private apiUrl = 'http://192.168.3.57:8000/api/dashboard';

  constructor(private http: HttpClient) { }

  getStats(): Observable<DashboardStats> {  // ← Método correcto
    return this.http.get<DashboardStats>(`${this.apiUrl}/admin/stats`);
  }

  getAdminStats(): Observable<DashboardStats> {  // ← Alias por compatibilidad
    return this.getStats();
  }
}
