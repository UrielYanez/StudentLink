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
    // Suscribirse a los cambios de usuario
    const sub1 = this.usuarioContext.username$.subscribe(name => {
      this.userName = name;
      this.isLoggedIn = !!name;
    });
    this.subscriptions.push(sub1);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
