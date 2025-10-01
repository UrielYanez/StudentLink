import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nabvar',
  standalone: false,
  templateUrl: './nabvar.html',
  styleUrl: './nabvar.scss'
})
export class Nabvar {
   isLoggedIn = true; // simula sesión
  userName = 'Brayan';

  constructor(private router: Router) {}

  logout() {
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}
