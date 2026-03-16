import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private apiUrl = `${environment.apiUrl}/categories`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<CategoryDto[]> {
        return this.http.get<CategoryDto[]>(this.apiUrl, { withCredentials: true });
    }

    create(data: { name: string; description?: string }): Observable<CategoryDto> {
        return this.http.post<CategoryDto>(this.apiUrl, data, { withCredentials: true });
    }
}
