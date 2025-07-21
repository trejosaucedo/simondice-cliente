import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/guest-layout').then((m) => m.GuestLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/landing/landing').then((m) => m.Landing),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register').then((m) => m.Register),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth-layout').then((m) => m.AuthLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'lobby',
        loadComponent: () =>
          import('./pages/lobby/lobby').then((m) => m.Lobby),
      },
      {
        path: 'room-config',
        loadComponent: () =>
          import('./pages/room-config/room-config').then(
            (m) => m.RoomConfigComponent
          ),
      },
      {
        path: 'waiting-room/:id',
        loadComponent: () =>
          import('./pages/waiting-room/waiting-room').then(
            (m) => m.WaitingRoomComponent
          ),
      },
      {
        path: 'game/:id',
        loadComponent: () =>
          import('./pages/game/game').then(
            (m) => m.GamePage
          ),
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
