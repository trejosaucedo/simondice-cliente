// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthLoginResponse,
  AuthRegisterResponse,
  FetchMeResponse
} from '../../shared/models/user.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  #http = inject(HttpClient);
  #router = inject(Router);
  private _user$ = new BehaviorSubject<FetchMeResponse['data'] | null>(null);
  public userChanges$ = this._user$.asObservable();

  // Actualiza el usuario desde el backend (ej. en login, registro o recarga de sesión)
  fetchMe(): Observable<FetchMeResponse> {
    return this.#http.get<FetchMeResponse>(
      `${environment.apiBaseUrl}/me`
    ).pipe(
      tap(res => this._user$.next(res.data))
    );
  }

  login(data: AuthLoginRequest): Observable<AuthLoginResponse> {
    return this.#http.post<AuthLoginResponse>(
      `${environment.apiBaseUrl}/login`, data, { withCredentials: true }
    );
  }

  register(data: AuthRegisterRequest): Observable<AuthRegisterResponse> {
    return this.#http.post<AuthRegisterResponse>(
      `${environment.apiBaseUrl}/register`, data, { withCredentials: true }
    ).pipe(
      tap(() => {
        this.fetchMe().subscribe();
      })
    );
  }

  logout(): Observable<any> {
    return this.#http
      .post(`${environment.apiBaseUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this._user$.next(null);
          localStorage.removeItem('access_token');
          this.#router.navigate(['/login'], { replaceUrl: true });
        })
      );
  }

  forceLogout() {
    localStorage.removeItem('access_token');
    this._user$.next(null);
    this.#router.navigate(['/login'], { replaceUrl: true });
  }
}
