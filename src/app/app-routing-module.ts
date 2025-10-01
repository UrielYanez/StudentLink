import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { homePrinciapal } from './components/home/home';
import { Errorpage } from './components/errorpage/errorpage';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  { path: 'home', component: homePrinciapal },
  { path: 'auth/login', component: Login },
  {path: '**',component: Errorpage},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
