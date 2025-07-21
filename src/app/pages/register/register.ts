import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AuthRegisterRequest, AuthRegisterResponse } from '../../shared/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  registerForm;
  loading = false;
  error = '';
  fieldErrors: Record<string, string> = {};

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.nonNullable.group({
      name: [''],
      email: [''],
      password: [''],
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.fieldErrors = {};

    const formData: AuthRegisterRequest = this.registerForm.getRawValue();

    this.auth.register(formData).subscribe({
      next: (_res: AuthRegisterResponse) => {
        this.loading = false;
        void this.router.navigate(['/login'], {
          queryParams: { registered: 'true' },
        });
      },
      error: (err) => {
        this.loading = false;
        const data = err.error?.data;
        if (data?.code === 'E_VALIDATION_ERROR' && Array.isArray(data.messages)) {
          for (const m of data.messages) {
            this.fieldErrors[m.field] = m.message;
          }
        } else {
          this.error = err.error?.message || 'Error al registrarse';
        }
      },
    });
  }
}


