import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AsesorService } from '../../services/asesor.service';

@Component({
  selector: 'app-asesor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asesor-dashboard.component.html',
  styleUrls: ['./asesor-dashboard.css']
})
export class AsesorDashboardComponent implements OnInit {
  userName: string = '';
  stats: any = {
    curso_asignado: 0,
    total_estudiantes: 0,
    promedio_general: 0
  };
  cursoInfo: any = null;
  loading: boolean = true;
  recentActivity: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private asesorService: AsesorService
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nombre_completo || user.username;
    }
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.asesorService.getDashboard().subscribe({
      next: (data) => {
        this.stats.curso_asignado = data.curso_asignado;
        this.stats.total_estudiantes = data.total_estudiantes;
        this.stats.promedio_general = data.promedio_general;
        this.cursoInfo = data.curso_info;
        this.recentActivity = data.recent_activity || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.loading = false;
      }
    });
  }

  verEstudiantes(): void {
    this.router.navigate(['/asesor/estudiantes']);
  }

  verReporteNotas(): void {
    this.router.navigate(['/asesor/reporte-notas']);
  }

  verAsistencia(): void {
    this.router.navigate(['/asesor/asistencia']);
  }

  logout(): void {
    this.authService.logout();
  }
}
