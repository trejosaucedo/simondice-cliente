// auth-layout.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AsyncPipe],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  private auth = inject(AuthService);
  user$ = this.auth.userChanges$;

  logout() {
    this.auth.logout().subscribe();
  }

  /** Nombre completo capitalizado */
  getName(name?: string | null): string {
    return name ? name.toUpperCase() : '...';
  }
}
