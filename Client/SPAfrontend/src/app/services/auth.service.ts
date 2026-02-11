import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/SPA/User';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string; role: string }> {
    return this.http.post<{ token: string; role: string }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('spa_token', res.token);
        localStorage.setItem('spa_role', res.role);
        localStorage.setItem('spa_username', username);
      })
    );
  }

  guestLogin(): Observable<{ token: string; role: string }> {
    return this.http.post<{ token: string; role: string }>(`${this.apiUrl}/guest-login`, {}).pipe(
      tap(res => {
        localStorage.setItem('spa_token', res.token);
        localStorage.setItem('spa_role', res.role);
        localStorage.setItem('spa_username', 'guest');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('spa_token');
    localStorage.removeItem('spa_role');
    localStorage.removeItem('spa_username');
  }

  getToken(): string | null {
    return localStorage.getItem('spa_token');
  }

  getRole(): string | null {
    return localStorage.getItem('spa_role');
  }

  getUsername(): string | null {
    return localStorage.getItem('spa_username');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
