import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        // Redirigir según el rol
        const role = response.user.role;
        if (role === 'administrador') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'profesor') {
          this.router.navigate(['/profesor/dashboard']);
        } else if (role === 'asesor') {
          this.router.navigate(['/asesor/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error en login', error);
        this.isLoading = false;
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos';
        }
      }
    });
  }
}

