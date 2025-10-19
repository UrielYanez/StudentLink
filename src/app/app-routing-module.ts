import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { homePrinciapal } from './components/home/home';
import { Errorpage } from './components/errorpage/errorpage';
import { homeMaching } from './matching/home/home';
import { AuthGuard } from './auth/Guard/auth-guard';
import { VacanteListComponent } from './reclutador/vacante-list-component/vacante-list-component';
import { VacanteFormComponent } from './reclutador/vacante-form-component/vacante-form-component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  { path: 'home', component: homePrinciapal },
  { path: 'auth/login', component: Login },

  //Rutas Reclutador
  { path: 'reclutador/vacantes' , component: VacanteListComponent},
  { path: 'reclutador/vacantes/nueva' , component: VacanteFormComponent},

  //Maching
  { path: 'home/dashboard', component: homeMaching ,   canActivate: [AuthGuard],},
  {path: '**',component: Errorpage},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
