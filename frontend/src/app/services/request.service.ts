import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceRequestDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RequestService {
    private apiUrl = `${environment.apiUrl}/requests`;

    constructor(private http: HttpClient) {}

    getAll(filters?: { status?: string; categoryId?: string; q?: string }): Observable<ServiceRequestDto[]> {
        let params = new HttpParams();
        if (filters) {
            if (filters.status) params = params.set('status', filters.status);
            if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
            if (filters.q) params = params.set('q', filters.q);
        }
        return this.http.get<ServiceRequestDto[]>(this.apiUrl, { params, withCredentials: true });
    }

    getById(id: string): Observable<ServiceRequestDto> {
        return this.http.get<ServiceRequestDto>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }

    create(data: { title: string; description: string; categoryId: string; location: string }): Observable<ServiceRequestDto> {
        return this.http.post<ServiceRequestDto>(this.apiUrl, data, { withCredentials: true });
    }

    updateStatus(id: string, status: string): Observable<ServiceRequestDto> {
        return this.http.patch<ServiceRequestDto>(`${this.apiUrl}/${id}/status`, { status }, { withCredentials: true });
    }
}
