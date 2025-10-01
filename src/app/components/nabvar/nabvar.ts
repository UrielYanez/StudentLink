import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nabvar',
  standalone: false,
  templateUrl: './nabvar.html',
  styleUrl: './nabvar.scss'
})
export class Nabvar {
   isLoggedIn = false; // simula sesión
  userName = 'Brayan';

  constructor(private router: Router) {}
  // Método para ocultar opciones según la ruta
  shouldShowOptions(): boolean {
    const hideOnPaths = ['/auth/login']; // rutas donde no se muestran opciones
    return !hideOnPaths.includes(this.router.url);
  }
  logout() {
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

    // Método para mostrar enlaces solo en /home
  showGuestLinks(): boolean {
    return this.router.url === '/home';
  }
}
