import { NgModule } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { App } from './app';
import { AppModule } from './app-module';
import { serverRoutes } from './app.routes.server';
import { Chat } from './components/chat/chat';

@NgModule({
  imports: [AppModule,Chat],
  providers: [provideServerRendering(withRoutes(serverRoutes))],
  bootstrap: [App],
})
export class AppServerModule {}
