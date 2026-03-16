import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryDto, ServiceRequestDto } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { RequestService } from '../../services/request.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-requests-list',
    standalone: false,
    template: `
      <div class="container">
        <h2>Service Requests</h2>

        <div class="form-row align-items-end mb-3">
          <div class="col-auto">
            <label>Status</label>
            <select class="form-control" [(ngModel)]="statusFilter" (change)="loadRequests()">
              <option value="">All</option>
              <option *ngFor="let s of statusOptions" [value]="s">{{ s | titlecase }}</option>
            </select>
          </div>

          <div class="col-auto">
            <label>Category</label>
            <select class="form-control" [(ngModel)]="categoryFilter" (change)="loadRequests()">
              <option value="">All</option>
              <option *ngFor="let c of categories" [value]="c._id">{{ c.name }}</option>
            </select>
          </div>

          <div class="col-auto">
            <label>Keyword</label>
            <input class="form-control" type="text" [(ngModel)]="qFilter" (keyup.enter)="loadRequests()" placeholder="Search" />
          </div>

          <div class="col-auto">
            <button class="btn btn-primary" (click)="loadRequests()">Apply</button>
            <button class="btn btn-secondary ml-2" (click)="clearFilters()">Clear</button>
          </div>

          <div class="col ml-auto text-right" *ngIf="isResident">
            <button class="btn btn-success" (click)="onCreateRequest()">New Request</button>
          </div>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <table class="table table-hover" *ngIf="requests.length > 0; else noRequests">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Location</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let request of requests" (click)="viewRequest(request._id)" style="cursor: pointer;">
              <td>{{ request.title }}</td>
              <td><span class="badge badge-info">{{ request.status }}</span></td>
              <td>{{ $any(request.categoryId)?.name || '-' }}</td>
              <td>{{ request.location }}</td>
              <td>{{ request.createdAt | date:'short' }}</td>
            </tr>
          </tbody>
        </table>

        <ng-template #noRequests>
          <div class="alert alert-info">No service requests found.</div>
        </ng-template>
      </div>
    `
})
export class RequestsListComponent implements OnInit {
    requests: ServiceRequestDto[] = [];
    categories: CategoryDto[] = [];
    statusOptions = ['open', 'quoted', 'assigned', 'completed', 'cancelled'];
    statusFilter = '';
    categoryFilter = '';
    qFilter = '';
    errorMessage = '';
    isResident = false;

    constructor(
        private requestService: RequestService,
        private categoryService: CategoryService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.isResident = this.authService.currentUser?.role === 'resident';
        this.loadCategories();
        this.loadRequests();
    }

    loadCategories(): void {
        this.categoryService.getAll().subscribe({
            next: (res) => this.categories = res,
            error: (err) => this.errorMessage = err?.error?.message || 'Failed to load categories'
        });
    }

    loadRequests(): void {
        const filters: any = {};
        if (this.statusFilter) filters.status = this.statusFilter;
        if (this.categoryFilter) filters.categoryId = this.categoryFilter;
        if (this.qFilter) filters.q = this.qFilter;

        this.requestService.getAll(filters).subscribe({
            next: (res) => {
                this.requests = res;
                this.errorMessage = '';
                this.cdr.detectChanges();
            },
            error: (err) => this.errorMessage = err?.error?.message || 'Failed to load requests'
        });
    }

    clearFilters(): void {
        this.statusFilter = '';
        this.categoryFilter = '';
        this.qFilter = '';
        this.loadRequests();
    }

    viewRequest(id: string): void {
        this.router.navigate(['/requests', id]);
    }

    onCreateRequest(): void {
        this.router.navigate(['/create-request']);
    }
}
