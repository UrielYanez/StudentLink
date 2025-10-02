import { Component } from '@angular/core';
import { Auth } from '../Service/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface LoginResponse {
  token: string;
  user?: any;
}
@Component({
  selector: 'app-login',
  standalone: true, // <--- aquí
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class Login {
  email = '';
  password = '';
  passwordVisible = false;
  isLoading = false;

  constructor(private authService: Auth, private router: Router) {}

  login(): void {
    // Validate fields
    if (!this.email || !this.password) {
      Swal.fire({
        icon: 'error',
        title: 'Campos requeridos',
        text: 'Por favor ingrese tanto el usuario como la contraseña',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    this.isLoading = true;
    
 this.authService.login(this.email, this.password).subscribe({
  next: (response) => {
    this.isLoading = false;

    // Guardamos token
    this.authService.setToken(response.token);

    // Obtenemos el rol principal
    const role = response.user.roles[0]?.name;

    if (role === 'ADMIN') {
      this.router.navigate(['admin/dashboard']);
    } else if (role === 'USER') {
      this.router.navigate(['home/dashboard']);
    } else {
      // Si no coincide con nada, a login otra vez
      Swal.fire({
        icon: 'warning',
        title: 'Rol desconocido',
        text: 'Tu cuenta no tiene permisos asignados.',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        this.router.navigate(['/auth/login']);
      });
    }
  },
  error: (err) => {
    this.isLoading = false;
    console.error('Error de inicio de sesión:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error al iniciar sesión',
      text: err.error?.message || 'Credenciales incorrectas',
      confirmButtonColor: '#3085d6',
    });
  },
});

  }
  
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
