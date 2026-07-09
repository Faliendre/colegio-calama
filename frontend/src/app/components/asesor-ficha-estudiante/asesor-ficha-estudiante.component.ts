import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AsesorService } from '../../services/asesor.service';

@Component({
  selector: 'app-asesor-ficha-estudiante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asesor-ficha-estudiante.component.html',
  styleUrls: ['./asesor-ficha-estudiante.css']
})
export class AsesorFichaEstudianteComponent implements OnInit {
  alumnoId: number = 0;
  ficha: any = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asesorService: AsesorService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.alumnoId = +params['id'];
      this.cargarFicha();
    });
  }

  cargarFicha(): void {
    this.asesorService.getFichaEstudiante(this.alumnoId).subscribe({
      next: (data) => {
        this.ficha = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando ficha:', err);
        this.loading = false;
      }
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  getColorNota(nota: number | null): string {
    if (nota === null) return '#9ca3af';
    if (nota >= 70) return '#10b981';
    if (nota >= 51) return '#f59e0b';
    return '#ef4444';
  }

  getColorAsistencia(porcentaje: number): string {
    if (porcentaje >= 90) return '#10b981';
    if (porcentaje >= 75) return '#3b82f6';
    if (porcentaje >= 60) return '#f59e0b';
    return '#ef4444';
  }

  volver(): void {
    this.router.navigate(['/asesor/estudiantes']);
  }
}
