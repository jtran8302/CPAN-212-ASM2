import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: false,
    template: `
      <div class="container" style="max-width: 480px; margin-top: 60px;">
        <h2>Register</h2>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>

          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input id="fullName" type="text" formControlName="fullName" class="form-control" />
            <div class="text-danger" *ngIf="registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid">
              <small *ngIf="registerForm.get('fullName')?.errors?.['required']">Full name is required.</small>
              <small *ngIf="registerForm.get('fullName')?.errors?.['minlength']">Full name must be at least 2 characters.</small>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" class="form-control" />
            <div class="text-danger" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
              <small *ngIf="registerForm.get('email')?.errors?.['required']">Email is required.</small>
              <small *ngIf="registerForm.get('email')?.errors?.['email']">Enter a valid email address.</small>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" class="form-control" />
            <div class="text-danger" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
              <small *ngIf="registerForm.get('password')?.errors?.['required']">Password is required.</small>
              <small *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters.</small>
            </div>
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" formControlName="role" class="form-control">
              <option value="">-- Select role --</option>
              <option value="resident">Resident</option>
              <option value="provider">Provider</option>
            </select>
            <div class="text-danger" *ngIf="registerForm.get('role')?.touched && registerForm.get('role')?.invalid">
              <small *ngIf="registerForm.get('role')?.errors?.['required']">Role is required.</small>
            </div>
          </div>

          <div class="text-danger mb-3" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="registerForm.invalid || loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>

        </form>

        <p class="mt-3 text-center">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    `
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err?.error?.message || 'Registration failed';
            }
        });
    }
}
