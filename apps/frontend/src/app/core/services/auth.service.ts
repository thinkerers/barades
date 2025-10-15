import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { SignupDto, LoginDto, AuthResponse, User } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'accessToken';
  private readonly API_URL = environment.apiUrl;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Sign up a new user
   */
  signup(dto: SignupDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/signup`, dto).pipe(
      tap((response) => this.setToken(response.accessToken))
    );
  }

  /**
   * Log in an existing user
   */
  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, dto).pipe(
      tap((response) => this.setToken(response.accessToken))
    );
  }

  /**
   * Log out current user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }

  /**
   * Get current user from JWT payload
   */
  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      return {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
    } catch {
      return null;
    }
  }

  /**
   * Store token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Check if token exists in localStorage
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Decode JWT token (simple base64 decode, no verification)
   */
  private decodeToken(token: string): { sub: string; username: string; email: string; firstName?: string; lastName?: string; exp: number; iat: number } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }
}
