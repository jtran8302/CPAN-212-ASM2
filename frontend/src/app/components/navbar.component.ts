import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserDto } from '../models/models';

@Component({
    selector: 'app-navbar',
    standalone: false,
    template: `
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" routerLink="/requests">NSM</a>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/requests">Requests</a>
            </li>
            <li class="nav-item" *ngIf="currentUser?.role === 'resident'">
              <a class="nav-link" routerLink="/create-request">New Request</a>
            </li>
            <li class="nav-item" *ngIf="currentUser?.role === 'provider'">
              <a class="nav-link" routerLink="/my-quotes">My Quotes</a>
            </li>
          </ul>
          <ul class="navbar-nav ml-auto">
            <li class="nav-item" *ngIf="!currentUser">
              <a class="nav-link" routerLink="/login">Login</a>
            </li>
            <li class="nav-item" *ngIf="!currentUser">
              <a class="nav-link" routerLink="/register">Register</a>
            </li>
            <li class="nav-item dropdown" *ngIf="currentUser">
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown">{{ currentUser.fullName }}</a>
              <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                <button class="dropdown-item" (click)="logout()">Logout</button>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    `
})
export class NavbarComponent implements OnInit {
    currentUser: UserDto | null = null;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => this.currentUser = user);
    }

    logout(): void {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: () => {
                this.router.navigate(['/login']);
            }
        });
    }
}

