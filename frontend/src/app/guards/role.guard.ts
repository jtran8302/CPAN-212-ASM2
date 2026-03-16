import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// protects routes that require a specific role
// usage in routing module:
//   { path: 'create-request', component: CreateRequestComponent,
//     canActivate: [AuthGuard, RoleGuard], data: { role: 'resident' } }

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const requiredRole = route.data['role'];
        const user = this.authService.currentUser;

        if (user && user.role === requiredRole) {
            return true;
        }

        this.router.navigate(['/requests']);
        return false;
    }
}
