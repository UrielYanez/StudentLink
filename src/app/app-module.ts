import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Nabvar } from './components/nabvar/nabvar';
import { Footer } from './components/footer/footer';
import { Errorpage } from './components/errorpage/errorpage';
import { Login } from './auth/login/login';
import { Home } from './reclutador/home/home';

@NgModule({
  declarations: [
    App,
    Nabvar,
    Footer,
    Errorpage,
    Login,
    Home
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,        // <<--- IMPORTANTE
    MatFormFieldModule,   // <<--- IMPORTANTE
    MatInputModule,        // <<--- IMPORTANTE
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
