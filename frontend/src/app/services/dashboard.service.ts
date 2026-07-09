import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface DashboardStats {
  total_users: number;
  students: number;
  teachers: number;
  advisors: number;
  active_courses: number;
  recent_activity?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = CONFIG.apiUrl;
  //private apiUrl = 'http://192.168.3.57:8000/api';

  constructor(private http: HttpClient) { }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }
}
