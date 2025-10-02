import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { homePrinciapal } from './components/home/home';
import { Errorpage } from './components/errorpage/errorpage';
import { homeMaching } from './matching/home/home';
import { AuthGuard } from './auth/Guard/auth-guard';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  { path: 'home', component: homePrinciapal },
  { path: 'auth/login', component: Login },
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
