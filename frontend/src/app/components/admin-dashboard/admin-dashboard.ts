import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  userName: string = '';
  totalUsers: number = 0;
  students: number = 0;
  teachers: number = 0;
  activeCourses: number = 0;
  isLoading: boolean = true;
  recentActivity: any[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nombre_completo || user.username;
    }
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.totalUsers = data.total_users;
        this.students = data.students;
        this.teachers = data.teachers;
        this.activeCourses = data.active_courses;
        this.recentActivity = data.recent_activity || [];
        this.isLoading = false;
        console.log('Estadísticas cargadas:', data);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.isLoading = false;
      }
    });
  }

  // ← AGREGAR ESTE MÉTODO AQUÍ
  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToCursos(): void {
    this.router.navigate(['/admin/cursos']);
  }

  navigateToAlumnos(): void {
    this.router.navigate(['/admin/alumnos']);
  }

  navigateToMatriculas(): void {
    this.router.navigate(['/admin/matriculas']);
  }

  navigateToAsignacionesProfesores(): void {
    this.router.navigate(['/admin/asignaciones-profesor']);
  }

  navigateToMaterias(): void {
    this.router.navigate(['/admin/materias']);
  }

  navigateToReporteAsistencias(): void {
    this.router.navigate(['/admin/reporte-asistencias']);
  }

  navigateToReporteCalificaciones(): void {
    this.router.navigate(['/admin/reporte-calificaciones']);
  }

  logout(): void {
    this.authService.logout();
  }
}
