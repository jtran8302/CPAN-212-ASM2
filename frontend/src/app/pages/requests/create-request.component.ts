import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryDto } from '../../models/models';
import { CategoryService } from '../../services/category.service';
import { RequestService } from '../../services/request.service';

@Component({
    selector: 'app-create-request',
    standalone: false,
    template: `
    <div class="container">
        <h2>Create Service Request</h2>

        <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-group">
                <label for="title">Title</label>
                <input id="title" type="text" formControlName="title" class="form-control" />
                <div class="text-danger" *ngIf="requestForm.get('title')?.touched && requestForm.get('title')?.invalid">
                    <small *ngIf="requestForm.get('title')?.errors?.['required']">Title is required.</small>
                    <small *ngIf="requestForm.get('title')?.errors?.['minlength']">Title must be at least 5 characters.</small>
                    <small *ngIf="requestForm.get('title')?.errors?.['maxlength']">Title cannot exceed 80 characters.</small>
                </div>
            </div>

            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" rows="5" formControlName="description" class="form-control"></textarea>
                <div class="text-danger" *ngIf="requestForm.get('description')?.touched && requestForm.get('description')?.invalid">
                    <small *ngIf="requestForm.get('description')?.errors?.['required']">Description is required.</small>
                    <small *ngIf="requestForm.get('description')?.errors?.['minlength']">Description must be at least 10 characters.</small>
                    <small *ngIf="requestForm.get('description')?.errors?.['maxlength']">Description cannot exceed 1000 characters.</small>
                </div>
            </div>

            <div class="form-group">
                <label for="categoryId">Category</label>
                <select id="categoryId" formControlName="categoryId" class="form-control">
                    <option value="">-- Select category --</option>
                    <option *ngFor="let category of categories" [value]="category._id">{{ category.name }}</option>
                </select>
                <div class="text-danger" *ngIf="requestForm.get('categoryId')?.touched && requestForm.get('categoryId')?.invalid">
                    <small *ngIf="requestForm.get('categoryId')?.errors?.['required']">Category is required.</small>
                </div>
            </div>

            <div class="form-group">
                <label for="location">Location</label>
                <input id="location" type="text" formControlName="location" class="form-control" />
                <div class="text-danger" *ngIf="requestForm.get('location')?.touched && requestForm.get('location')?.invalid">
                    <small *ngIf="requestForm.get('location')?.errors?.['required']">Location is required.</small>
                    <small *ngIf="requestForm.get('location')?.errors?.['minlength']">Location must be at least 2 characters.</small>
                    <small *ngIf="requestForm.get('location')?.errors?.['maxlength']">Location cannot exceed 80 characters.</small>
                </div>
            </div>

            <div class="mt-3">
                <button type="submit" class="btn btn-primary" [disabled]="requestForm.invalid || loading">Create Request</button>
                <button type="button" class="btn btn-secondary ml-2" (click)="onCancel()" [disabled]="loading">Cancel</button>
            </div>

            <div class="text-danger mt-3" *ngIf="errorMessage">{{ errorMessage }}</div>
        </form>
    </div>
    `
})
export class CreateRequestComponent implements OnInit {
    categories: CategoryDto[] = [];
    requestForm!: FormGroup;
    loading = false;
    errorMessage = '';

    constructor(
        private requestService: RequestService,
        private categoryService: CategoryService,
        private fb: FormBuilder,
        private router: Router
    ) {}

    ngOnInit() {
        this.requestForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(80)]],
            description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
            categoryId: ['', Validators.required],
            location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]]
        });

        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getAll().subscribe({
            next: (res) => { this.categories = res; },
            error: (err) => { this.errorMessage = err?.error?.message || 'Failed to load categories'; }
        });
    }

    onSubmit() {
        if (this.requestForm.invalid) {
            this.requestForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.requestService.create(this.requestForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/requests']);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err?.error?.message || 'Failed to create request';
            }
        });
    }

    onCancel() {
        this.router.navigate(['/requests']);
    }
}

