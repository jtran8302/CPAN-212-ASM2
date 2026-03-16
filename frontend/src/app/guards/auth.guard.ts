import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

// protects routes that require login
// if no active session -> redirect to /login
// checks /api/auth/me on first load to restore session from cookie

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate() {
        if (this.authService.currentUser) {
            return true;
        }

        return this.authService.me().pipe(
            map(() => true),
            catchError(() => {
                this.router.navigate(['/login']);
                return of(false);
            })
        );
    }
}
