import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: false,
    template: `
      <div class="container" style="max-width: 480px; margin-top: 60px;">
        <h2>Login</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" class="form-control" />
            <div class="text-danger" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              <small *ngIf="loginForm.get('email')?.errors?.['required']">Email is required.</small>
              <small *ngIf="loginForm.get('email')?.errors?.['email']">Enter a valid email address.</small>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" class="form-control" />
            <div class="text-danger" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              <small *ngIf="loginForm.get('password')?.errors?.['required']">Password is required.</small>
            </div>
          </div>

          <div class="text-danger mb-3" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

        </form>

        <p class="mt-3 text-center">
          Don't have an account? <a routerLink="/register">Register</a>
        </p>
      </div>
    `
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/requests']);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err?.error?.message || 'Invalid credentials';
            }
        });
    }
}
