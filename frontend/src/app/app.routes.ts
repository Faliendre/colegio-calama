import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { ProfesorDashboardComponent } from './components/profesor-dashboard/profesor-dashboard';
import { AsesorDashboardComponent } from './components/asesor-dashboard/asesor-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management';
import { authGuard } from './guards/auth.guard';
import { CursoManagementComponent } from './components/curso-management/curso-management';
import { AlumnoManagementComponent } from './components/alumno-management/alumno-management';
import { MatriculaManagementComponent } from './components/matricula-management/matricula-management';
import { AsignacionProfesorManagementComponent } from './components/asignacion-profesor-management/asignacion-profesor-management';
import { MateriaManagementComponent } from './components/materia-management/materia-management';
import { ReporteAsistenciasComponent } from './components/reporte-asistencias/reporte-asistencias';
import { ReporteCalificacionesComponent } from './components/reporte-calificaciones/reporte-calificaciones';
import { ProfesorCursoComponent } from './components/profesor-curso/profesor-curso';
import { AsesorEstudiantesComponent } from './components/asesor-estudiantes/asesor-estudiantes';
import { AsesorReporteNotasComponent } from './components/asesor-reporte-notas/asesor-reporte-notas.component';
import { AsesorAsistenciaComponent } from './components/asesor-asistencia/asesor-asistencia.component';
import { AsesorFichaEstudianteComponent } from './components/asesor-ficha-estudiante/asesor-ficha-estudiante.component';
import { GestionAcademicaComponent } from './components/gestion-academica/gestion-academica.component';
import { PromocionAlumnosComponent } from './components/promocion-alumnos/promocion-alumnos.component';
import { ActaCalificacionesComponent } from './components/acta-calificaciones/acta-calificaciones.component';



export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/users',
    component: UserManagementComponent,
    canActivate: [authGuard]  // ← Ahora sí puedes activar el guard
  },
  {
    path: 'profesor/dashboard',
    component: ProfesorDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'asesor/dashboard',
    component: AsesorDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/cursos',
    component: CursoManagementComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/alumnos',
    component: AlumnoManagementComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/matriculas',
    component: MatriculaManagementComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/asignaciones-profesor',
    component: AsignacionProfesorManagementComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/materias',
    component: MateriaManagementComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/reporte-asistencias',
    component: ReporteAsistenciasComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/reporte-calificaciones',
    component: ReporteCalificacionesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/gestion-academica',
    component: GestionAcademicaComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/promocion-alumnos',
    component: PromocionAlumnosComponent,
    canActivate: [authGuard]
  },

  // En las rutas de admin:
  {
    path: 'admin/acta-calificaciones',
    component: ActaCalificacionesComponent,
    canActivate: [authGuard]
  },

  { path: 'profesor/dashboard', component: ProfesorDashboardComponent },
  { path: 'profesor/dashboard', component: ProfesorDashboardComponent, canActivate: [authGuard] },
  { path: 'profesor/curso/:id', component: ProfesorCursoComponent, canActivate: [authGuard] },
  // Rutas Asesor
  { path: 'asesor/dashboard', component: AsesorDashboardComponent, canActivate: [authGuard] },
  { path: 'asesor/estudiantes', component: AsesorEstudiantesComponent, canActivate: [authGuard] },
  { path: 'asesor/reporte-notas', component: AsesorReporteNotasComponent, canActivate: [authGuard] },
  { path: 'asesor/asistencia', component: AsesorAsistenciaComponent, canActivate: [authGuard] },
  { path: 'asesor/estudiante/:id', component: AsesorFichaEstudianteComponent, canActivate: [authGuard] },


  // ⚠️ IMPORTANTE: Esta ruta SIEMPRE debe estar al FINAL
  { path: '**', redirectTo: '/login' }
];
