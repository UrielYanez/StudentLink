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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Nabvar } from './components/nabvar/nabvar';
import { Footer } from './components/footer/footer';
import { Errorpage } from './components/errorpage/errorpage';
import { Login } from './auth/login/login';
import { homePrinciapal } from './components/home/home';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './auth/Interceptor/auth-interceptor';
import { VacanteListComponent } from './reclutador/vacante-list-component/vacante-list-component';
import { VacanteFormComponent } from './reclutador/vacante-form-component/vacante-form-component';
import { RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { homeMaching } from './matching/home/home';
import { Maching } from './service/maching';
import { PerfilUsuarioComponent } from './users/perfil-usuario-component/perfil-usuario-component';
import { SlugifyPipe } from './pipes/slugify-pipe';
import { CvComponent } from './users/cv-component/cv-component';


@NgModule({
  declarations: [
    App,
    Footer,
    Errorpage,
    homePrinciapal,
    homeMaching,
    VacanteListComponent,
    VacanteFormComponent,
    homeMaching,
    PerfilUsuarioComponent,
    SlugifyPipe,
    CvComponent,

  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    FormsModule,
    MatCardModule,        // <<--- IMPORTANTE
    MatFormFieldModule,   // <<--- IMPORTANTE
    MatInputModule,        // <<--- IMPORTANTE
    MatCheckboxModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    Nabvar,
    Login,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    DecimalPipe,
    Maching
  ],
  bootstrap: [App]
})
export class AppModule { }
