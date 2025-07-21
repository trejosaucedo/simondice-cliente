import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';         // <-- importa aquí
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { FetchMeResponse } from '../../shared/models/user.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe
  ],
  templateUrl: './landing.html',
})
export class Landing {
  user$: Observable<FetchMeResponse['data'] | null>;
  constructor(private auth: AuthService) {
    this.user$ = this.auth.userChanges$;
    this.auth.fetchMe().subscribe();
  }
}
