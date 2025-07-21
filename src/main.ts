import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { App } from './app/app';
import { authErrorInterceptor } from './app/core/interceptors/auth-error.interceptor';
import { tokenInterceptor } from './app/core/interceptors/token.interceptor';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      withInterceptors([
        tokenInterceptor,
        authErrorInterceptor,
      ])
    ),
    provideRouter(routes),
  ]
});

