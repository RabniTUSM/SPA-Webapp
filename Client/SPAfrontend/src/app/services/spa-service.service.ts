import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpaServiceInputDTO, SpaServiceOutputDTO } from '../models/spa-service.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SpaServiceService {
  private apiUrl = '/SPA/Service';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  createService(service: SpaServiceInputDTO): Observable<any> {
    return this.http.post(this.apiUrl, service, { headers: this.getHeaders() });
  }

  getServiceById(id: number): Observable<SpaServiceOutputDTO> {
    return this.http.get<SpaServiceOutputDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAllServices(): Observable<SpaServiceOutputDTO[]> {
    return this.http.get<SpaServiceOutputDTO[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  updateService(id: number, service: SpaServiceInputDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, service, { headers: this.getHeaders() });
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  exportServicesPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }
}
