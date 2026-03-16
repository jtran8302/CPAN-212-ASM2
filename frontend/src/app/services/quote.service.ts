import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuoteDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class QuoteService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getQuotesForRequest(requestId: string): Observable<QuoteDto[]> {
        return this.http.get<QuoteDto[]>(`${this.apiUrl}/requests/${requestId}/quotes`, { withCredentials: true });
    }

    submitQuote(requestId: string, data: { price: number; message: string; daysToComplete: number }): Observable<QuoteDto> {
        return this.http.post<QuoteDto>(`${this.apiUrl}/requests/${requestId}/quotes`, data, { withCredentials: true });
    }

    acceptQuote(quoteId: string): Observable<QuoteDto> {
        return this.http.patch<QuoteDto>(`${this.apiUrl}/quotes/${quoteId}/accept`, {}, { withCredentials: true });
    }
}
