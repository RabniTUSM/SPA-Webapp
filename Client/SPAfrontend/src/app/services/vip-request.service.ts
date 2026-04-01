import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface VipRequest {
  id: number;
  username: string;
  name: string;
  message: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({ providedIn: 'root' })
export class VipRequestService {
  private apiUrl = '/SPA/VipRequest';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  submitRequest(message: string): Observable<VipRequest> {
    return this.http.post<VipRequest>(this.apiUrl, { message }, { headers: this.getHeaders() });
  }

  getMyRequests(): Observable<VipRequest[]> {
    return this.http.get<VipRequest[]>(`${this.apiUrl}/my`, { headers: this.getHeaders() });
  }

  getPendingRequests(): Observable<VipRequest[]> {
    return this.http.get<VipRequest[]>(`${this.apiUrl}/pending`, { headers: this.getHeaders() });
  }

  approveRequest(id: number): Observable<VipRequest> {
    return this.http.post<VipRequest>(`${this.apiUrl}/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectRequest(id: number): Observable<VipRequest> {
    return this.http.post<VipRequest>(`${this.apiUrl}/${id}/reject`, {}, { headers: this.getHeaders() });
  }
}
