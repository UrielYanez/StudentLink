import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { Subscription } from 'rxjs';
import { UsuarioContextService } from '../../auth/Service/usuario-context-service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nabvar',
  templateUrl: './nabvar.html',
  styleUrls: ['./nabvar.scss'],
    imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
})
export class Nabvar implements OnInit, OnDestroy {
  isLoggedIn = false;
  userName: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private usuarioContext: UsuarioContextService) {}

  ngOnInit(): void {
    const sub1 = this.usuarioContext.username$.subscribe(name => {
      this.userName = name;
      this.isLoggedIn = !!name;
    });
    this.subscriptions.push(sub1);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Obtener las iniciales del usuario (máximo 2 letras)
  getUserInitials(): string {
    if (!this.userName) return '';
    
    const names = this.userName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.userName.substring(0, 2).toUpperCase();
  }

  // Truncar nombre si tiene más de 10 caracteres
  getDisplayName(): string {
    if (!this.userName) return '';
    
    if (this.userName.length > 10) {
      return this.userName.substring(0, 14) ;
    }
    return this.userName;
  }

  shouldShowOptions(): boolean {
    const hideOnPaths = ['/auth/login'];
    return !hideOnPaths.includes(this.router.url);
  }

  logout() {
    this.usuarioContext.limpiarDatos();
    this.router.navigate(['/auth/login']);
  }

  goToProfile() {
    this.router.navigate(['profile']);
  }

  goToSettings() {
    this.router.navigate(['settings']);
  }

  showGuestLinks(): boolean {
    return this.router.url === '/home' && !this.isLoggedIn;
  }
}