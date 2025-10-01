import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';

const routes: Routes = [
    {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
    { path: 'auth/login', component: Login },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  
 }
