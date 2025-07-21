import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AuthLoginRequest, AuthLoginResponse } from '../../shared/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  loginForm;
  loading = false;
  error = '';
  fieldErrors: Record<string, string> = {};
  registered = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: [''],
      password: [''],
    });

    this.route.queryParams.subscribe((params) => {
      this.registered = params['registered'] === 'true';
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.fieldErrors = {};

    const loginData: AuthLoginRequest = this.loginForm.getRawValue();

    this.auth.login(loginData).subscribe({
      next: (res: AuthLoginResponse) => {
        this.loading = false;
        // Guarda el token primero
        localStorage.setItem('access_token', res.data.token);

        this.router.navigate(['/lobby']);
      },
      error: (err) => {
        this.loading = false;
        const data = err.error?.data;
        if (data?.code === 'E_VALIDATION_ERROR' && Array.isArray(data.messages)) {
          for (const m of data.messages) {
            this.fieldErrors[m.field] = m.message;
          }
        } else {
          this.error = err.error?.message || 'Error al iniciar sesión';
        }
      },
    });
  }

}
