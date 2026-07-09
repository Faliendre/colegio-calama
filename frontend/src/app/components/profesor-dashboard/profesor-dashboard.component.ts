import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfesorService } from '../../services/profesor.service';

interface DashboardStats {
  cursos_asignados: number;
  total_alumnos: number;
  asistencias_hoy: number;
  recent_activity?: any[];
}

interface Curso {
  curso_id: number;
  grado: string;
  paralelo: string;
  materia: string;
  materia_id: number;
  asignacion_id: number;
  total_alumnos: number;
}

@Component({
  selector: 'app-profesor-dashboard',
  imports: [CommonModule],
  templateUrl: './profesor-dashboard.component.html',
  styles: []
})
export class ProfesorDashboardComponent implements OnInit {
  userName: string = '';
  stats: DashboardStats = {
    cursos_asignados: 0,
    total_alumnos: 0,
    asistencias_hoy: 0
  };
  cursos: Curso[] = [];
  loading: boolean = true;
  recentActivity: any[] = [];

  constructor(
    private authService: AuthService,
    private profesorService: ProfesorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nombre_completo;
    }
    this.loadDashboard();
    this.loadCursos();
  }

  loadDashboard(): void {
    this.profesorService.getDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.recentActivity = data.recent_activity || [];
      },
      error: (err) => console.error('Error cargando dashboard:', err)
    });
  }

  loadCursos(): void {
    this.profesorService.getMisCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando cursos:', err);
        this.loading = false;
      }
    });
  }

  verCurso(curso: any): void {
    this.router.navigate(['/profesor/curso', curso.curso_id], {
      queryParams: {
        asignacion_id: curso.asignacion_id,
        materia_id: curso.materia_id,
        grado: curso.grado,
        paralelo: curso.paralelo,
        materia: curso.materia
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
