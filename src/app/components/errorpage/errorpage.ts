import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-errorpage',
  standalone: false,
  templateUrl: './errorpage.html',
  styleUrl: './errorpage.scss'
})
export class Errorpage {
  constructor(private router: Router) {}
  goHome() {
   
    this.router.navigate(['/']);
  }
}
