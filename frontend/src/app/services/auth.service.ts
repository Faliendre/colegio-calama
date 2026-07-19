import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from './alert.service';

export interface User {
  id: number;
  username: string;
  nombre_completo: string;
  role: 'administrador' | 'profesor' | 'asesor';
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = CONFIG.apiUrl;

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  private inactivityTimeout: any;
  private readonly INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos de inactividad
  private boundResetTimer = this.resetInactivityTimer.bind(this);

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();

    // Si ya está autenticado al iniciar el servicio, comenzar control de inactividad
    if (this.isAuthenticated()) {
      this.iniciarControlInactividad();
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
        this.iniciarControlInactividad();
      })
    );
  }

  logout(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    }
    this.detenerControlInactividad();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // --- Métodos de Control de Inactividad ---

  iniciarControlInactividad(): void {
    this.detenerControlInactividad();
    this.resetInactivityTimer();

    window.addEventListener('mousemove', this.boundResetTimer);
    window.addEventListener('mousedown', this.boundResetTimer);
    window.addEventListener('keypress', this.boundResetTimer);
    window.addEventListener('scroll', this.boundResetTimer);
    window.addEventListener('touchstart', this.boundResetTimer);
  }

  detenerControlInactividad(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    window.removeEventListener('mousemove', this.boundResetTimer);
    window.removeEventListener('mousedown', this.boundResetTimer);
    window.removeEventListener('keypress', this.boundResetTimer);
    window.removeEventListener('scroll', this.boundResetTimer);
    window.removeEventListener('touchstart', this.boundResetTimer);
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    this.inactivityTimeout = setTimeout(() => {
      this.autoLogoutPorInactividad();
    }, this.INACTIVITY_LIMIT);
  }

  private autoLogoutPorInactividad(): void {
    this.logout();
    this.alertService.alert('Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.', 'info');
  }
}

