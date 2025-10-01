import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

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
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [App]
})
export class AppModule { }
