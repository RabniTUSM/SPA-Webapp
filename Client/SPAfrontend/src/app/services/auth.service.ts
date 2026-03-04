import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

const AUTH_TOKEN_KEY = 'aurelia-auth-token';
const AUTH_ROLE_KEY = 'aurelia-auth-role';
const AUTH_USERNAME_KEY = 'aurelia-auth-username';

export interface AuthSessionState {
  token: string | null;
  role: string | null;
  username: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/SPA/User';
  private token: string | null = null;
  private role: string | null = null;
  private username: string | null = null;
  private readonly sessionStateSubject = new BehaviorSubject<AuthSessionState>({
    token: null,
    role: null,
    username: null
  });
  readonly sessionState$ = this.sessionStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession();
    this.emitSessionState();
  }

  login(username: string, password: string): Observable<{ token: string; role: string }> {
    return this.http.post<{ token: string; role: string }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        this.token = res.token;
        this.role = res.role;
        this.username = username;
        this.persistSession();
        this.emitSessionState();
      })
    );
  }

  guestLogin(): Observable<{ token: string; role: string }> {
    return this.http.post<{ token: string; role: string }>(`${this.apiUrl}/guest-login`, {}).pipe(
      tap(res => {
        this.token = res.token;
        this.role = res.role;
        this.username = 'guest';
        this.persistSession();
        this.emitSessionState();
      })
    );
  }

  logout(): void {
    this.token = null;
    this.role = null;
    this.username = null;
    this.clearSession();
    this.emitSessionState();
  }

  getToken(): string | null {
    return this.token;
  }

  getRole(): string | null {
    return this.role;
  }

  setRole(role: string | null): void {
    this.role = role;
    this.persistSession();
    this.emitSessionState();
  }

  getUsername(): string | null {
    return this.username;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private restoreSession(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    this.role = window.localStorage.getItem(AUTH_ROLE_KEY);
    this.username = window.localStorage.getItem(AUTH_USERNAME_KEY);
  }

  private persistSession(): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (this.token) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, this.token);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    if (this.role) {
      window.localStorage.setItem(AUTH_ROLE_KEY, this.role);
    } else {
      window.localStorage.removeItem(AUTH_ROLE_KEY);
    }
    if (this.username) {
      window.localStorage.setItem(AUTH_USERNAME_KEY, this.username);
    } else {
      window.localStorage.removeItem(AUTH_USERNAME_KEY);
    }
  }

  private clearSession(): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_ROLE_KEY);
    window.localStorage.removeItem(AUTH_USERNAME_KEY);
  }

  private emitSessionState(): void {
    this.sessionStateSubject.next({
      token: this.token,
      role: this.role,
      username: this.username
    });
  }
}
