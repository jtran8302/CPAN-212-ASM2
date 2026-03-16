import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteDto, ServiceRequestDto } from '../../models/models';
import { QuoteService } from '../../services/quote.service';
import { RequestService } from '../../services/request.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-my-quotes',
    standalone: false,
    template: `
      <div class="container">
        <h2>My Quotes</h2>

        <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <div *ngIf="entries.length === 0 && !errorMessage" class="alert alert-info">
          You haven't submitted any quotes yet.
        </div>

        <div class="card mb-3" *ngFor="let entry of entries" style="cursor: pointer;" (click)="goToRequest(entry.quote.requestId)">
          <div class="card-body">
            <h6 class="card-title">{{ entry.requestTitle }}</h6>
            <p class="mb-1"><strong>Price:</strong> {{ entry.quote.price }}</p>
            <p class="mb-1"><strong>Days to complete:</strong> {{ entry.quote.daysToComplete }}</p>
            <p class="mb-2 text-muted">{{ entry.quote.message }}</p>
            <span class="badge"
              [class.badge-secondary]="entry.quote.status === 'pending'"
              [class.badge-success]="entry.quote.status === 'accepted'"
              [class.badge-danger]="entry.quote.status === 'rejected'">
              {{ entry.quote.status }}
            </span>
          </div>
        </div>
      </div>
    `
})
export class MyQuotesComponent implements OnInit {
    entries: { quote: QuoteDto; requestTitle: string }[] = [];
    errorMessage = '';

    constructor(
        private requestService: RequestService,
        private quoteService: QuoteService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadMyQuotes();
    }

    loadMyQuotes(): void {
        // get all requests, then for each load provider's own quotes
        this.requestService.getAll().subscribe({
            next: (requests) => {
                requests.forEach((request) => {
                    this.quoteService.getQuotesForRequest(request._id).subscribe({
                        next: (quotes) => {
                            quotes.forEach((quote) => {
                                this.entries.push({ quote, requestTitle: request.title });
                            });
                            this.cdr.detectChanges();
                        }
                    });
                });
            },
            error: (err) => this.errorMessage = err?.error?.message || 'Failed to load quotes'
        });
    }

    goToRequest(requestId: string): void {
        this.router.navigate(['/requests', requestId]);
    }
}
