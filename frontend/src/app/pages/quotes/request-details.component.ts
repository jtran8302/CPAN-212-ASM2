import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryDto, QuoteDto, ServiceRequestDto, UserDto } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { QuoteService } from '../../services/quote.service';
import { RequestService } from '../../services/request.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-request-details',
    standalone: false,
    template: `
      <div class="container" *ngIf="request; else loading">
        <h2>{{ request.title }}</h2>

        <div class="mb-3">
          <span class="badge badge-info mr-2">{{ request.status }}</span>
          <span class="text-muted">{{ request.location }}</span>
        </div>

        <p>{{ request.description }}</p>
        <p><strong>Category:</strong> {{ $any(request.categoryId)?.name || '-' }}</p>
        <p><strong>Posted by:</strong> {{ $any(request.createdBy)?.fullName || '-' }}</p>
        <p><strong>Created:</strong> {{ request.createdAt | date:'medium' }}</p>

        <!-- resident actions -->
        <div *ngIf="isResident">
          <div class="mb-3" *ngIf="request.status === 'open' || request.status === 'quoted'">
            <button class="btn btn-danger mr-2" (click)="cancelRequest()">Cancel Request</button>
          </div>
          <div class="mb-3" *ngIf="request.status === 'assigned'">
            <button class="btn btn-success" (click)="completeRequest()">Mark as Completed</button>
          </div>

          <h4>Quotes ({{ quotes.length }})</h4>
          <div *ngIf="quotes.length === 0" class="alert alert-info">No quotes yet.</div>

          <div class="card mb-3" *ngFor="let quote of quotes"
               [class.border-success]="quote.status === 'accepted'"
               [class.border-secondary]="quote.status === 'rejected'">
            <div class="card-body">
              <h6 class="card-title">{{ $any(quote.providerId)?.fullName || 'Provider' }}</h6>
              <p class="mb-1"><strong>Price:</strong> {{ quote.price }}</p>
              <p class="mb-1"><strong>Days to complete:</strong> {{ quote.daysToComplete }}</p>
              <p class="mb-2">{{ quote.message }}</p>
              <span class="badge"
                [class.badge-secondary]="quote.status === 'pending'"
                [class.badge-success]="quote.status === 'accepted'"
                [class.badge-danger]="quote.status === 'rejected'">
                {{ quote.status }}
              </span>
              <button
                *ngIf="request.status === 'quoted' && quote.status === 'pending'"
                class="btn btn-sm btn-primary ml-3"
                [disabled]="accepting"
                (click)="onAcceptQuote(quote._id)">
                Accept
              </button>
            </div>
          </div>
        </div>

        <!-- provider view -->
        <div *ngIf="isProvider">
          <div *ngIf="myQuote; else showForm">
            <h4>Your Quote</h4>
            <div class="card">
              <div class="card-body">
                <p><strong>Price:</strong> {{ myQuote.price }}</p>
                <p><strong>Days to complete:</strong> {{ myQuote.daysToComplete }}</p>
                <p>{{ myQuote.message }}</p>
                <span class="badge"
                  [class.badge-secondary]="myQuote.status === 'pending'"
                  [class.badge-success]="myQuote.status === 'accepted'"
                  [class.badge-danger]="myQuote.status === 'rejected'">
                  {{ myQuote.status }}
                </span>
              </div>
            </div>
          </div>

          <ng-template #showForm>
            <div *ngIf="request.status === 'open' || request.status === 'quoted'">
              <h4>Submit a Quote</h4>
              <form [formGroup]="quoteForm" (ngSubmit)="onSubmitQuote()" novalidate>
                <div class="form-group">
                  <label>Price ($)</label>
                  <input type="number" formControlName="price" class="form-control" />
                  <div class="text-danger" *ngIf="quoteForm.get('price')?.touched && quoteForm.get('price')?.invalid">
                    <small *ngIf="quoteForm.get('price')?.errors?.['required']">Price is required.</small>
                    <small *ngIf="quoteForm.get('price')?.errors?.['min']">Price must be at least 1.</small>
                  </div>
                </div>

                <div class="form-group">
                  <label>Days to Complete</label>
                  <input type="number" formControlName="daysToComplete" class="form-control" />
                  <div class="text-danger" *ngIf="quoteForm.get('daysToComplete')?.touched && quoteForm.get('daysToComplete')?.invalid">
                    <small *ngIf="quoteForm.get('daysToComplete')?.errors?.['required']">Days to complete is required.</small>
                    <small *ngIf="quoteForm.get('daysToComplete')?.errors?.['min']">Minimum 1 day.</small>
                    <small *ngIf="quoteForm.get('daysToComplete')?.errors?.['max']">Maximum 30 days.</small>
                  </div>
                </div>

                <div class="form-group">
                  <label>Message</label>
                  <textarea rows="4" formControlName="message" class="form-control"></textarea>
                  <div class="text-danger" *ngIf="quoteForm.get('message')?.touched && quoteForm.get('message')?.invalid">
                    <small *ngIf="quoteForm.get('message')?.errors?.['required']">Message is required.</small>
                    <small *ngIf="quoteForm.get('message')?.errors?.['minlength']">Message must be at least 5 characters.</small>
                    <small *ngIf="quoteForm.get('message')?.errors?.['maxlength']">Message cannot exceed 500 characters.</small>
                  </div>
                </div>

                <div class="text-danger mb-2" *ngIf="errorMessage">{{ errorMessage }}</div>
                <button type="submit" class="btn btn-primary" [disabled]="quoteForm.invalid || submitting">Submit Quote</button>
              </form>
            </div>
          </ng-template>
        </div>

        <div class="text-danger mt-3" *ngIf="errorMessage && !isProvider">{{ errorMessage }}</div>
        <button class="btn btn-link mt-3" (click)="goBack()">Back to Requests</button>
      </div>

      <ng-template #loading>
        <div class="container"><p>Loading...</p></div>
      </ng-template>
    `
})
export class RequestDetailsComponent implements OnInit {
    request: ServiceRequestDto | null = null;
    quotes: QuoteDto[] = [];
    myQuote: QuoteDto | null = null;
    quoteForm!: FormGroup;
    isResident = false;
    isProvider = false;
    loading = false;
    submitting = false;
    accepting = false;
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private requestService: RequestService,
        private quoteService: QuoteService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        const role = this.authService.currentUser?.role;
        this.isResident = role === 'resident';
        this.isProvider = role === 'provider';

        this.quoteForm = this.fb.group({
            price: [null, [Validators.required, Validators.min(1)]],
            daysToComplete: [null, [Validators.required, Validators.min(1), Validators.max(30)]],
            message: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
        });

        const id = this.route.snapshot.paramMap.get('id');
        console.log('route id:', id);
        console.log('current user:', this.authService.currentUser);
        if (id) {
            this.loadRequest(id);
            this.loadQuotes(id);
        }
    }

    loadRequest(id: string): void {
    this.requestService.getById(id).subscribe({
        next: (res) => {
            this.request = res;
            this.cdr.detectChanges();
        },
          error: (err) => this.errorMessage = err?.error?.message || 'Failed to load request'
        });
    }

    loadQuotes(id: string): void {
        this.quoteService.getQuotesForRequest(id).subscribe({
            next: (res) => {
                this.quotes = res;
                if (this.isProvider) {
                    const userId = this.authService.currentUser?._id;
                    this.myQuote = res.find(q => {
                        const provider = q.providerId as any;
                        return (provider?._id || provider) === userId;
                    }) || null;
                }
                this.cdr.detectChanges();
            },
            error: (err) => this.errorMessage = err?.error?.message || 'Failed to load quotes'
        });
    }

    onAcceptQuote(quoteId: string): void {
        this.accepting = true;
        this.errorMessage = '';
        this.quoteService.acceptQuote(quoteId).subscribe({
            next: () => {
                this.accepting = false;
                const id = this.route.snapshot.paramMap.get('id')!;
                this.loadRequest(id);
                this.loadQuotes(id);
            },
            error: (err) => {
                this.accepting = false;
                this.errorMessage = err?.error?.message || 'Failed to accept quote';
            }
        });
    }

    onSubmitQuote(): void {
        if (this.quoteForm.invalid) {
            this.quoteForm.markAllAsTouched();
            return;
        }
        this.submitting = true;
        this.errorMessage = '';
        const id = this.route.snapshot.paramMap.get('id')!;
        this.quoteService.submitQuote(id, this.quoteForm.value).subscribe({
            next: (quote) => {
                this.submitting = false;
                this.myQuote = quote;
                this.loadQuotes(id);
            },
            error: (err) => {
                this.submitting = false;
                this.errorMessage = err?.error?.message || 'Failed to submit quote';
            }
        });
    }

    cancelRequest(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.requestService.updateStatus(id, 'cancelled').subscribe({
            next: (res) => this.request = res,
            error: (err) => this.errorMessage = err?.error?.message || 'Failed to cancel request'
        });
    }

    completeRequest(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.requestService.updateStatus(id, 'completed').subscribe({
            next: (res) => this.request = res,
            error: (err) => this.errorMessage = err?.error?.message || 'Failed to complete request'
        });
    }

    goBack(): void {
        this.router.navigate(['/requests']);
    }
}
