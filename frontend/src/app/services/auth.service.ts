import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private apiUrl = `${environment.apiUrl}/auth`;

    // holds the current logged-in user in memory
    // components subscribe to this to react when login/logout happens
    private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {}

    get currentUser(): UserDto | null {
        return this.currentUserSubject.value;
    }

    register(data: { fullName: string; email: string; password: string; role: string }): Observable<UserDto> {
        return this.http.post<UserDto>(`${this.apiUrl}/register`, data, { withCredentials: true });
    }

    login(data: { email: string; password: string }): Observable<UserDto> {
        return this.http.post<UserDto>(`${this.apiUrl}/login`, data, { withCredentials: true }).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }

    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => this.currentUserSubject.next(null))
        );
    }

    // called on app startup to restore session if cookie is still valid
    me(): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }
}
