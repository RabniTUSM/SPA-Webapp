import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleInputDTO, RoleOutputDTO } from '../models/role.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = '/SPA/Role';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  createRole(role: RoleInputDTO): Observable<any> {
    return this.http.post(this.apiUrl, role, { headers: this.getHeaders() });
  }

  getRoleById(id: number): Observable<RoleOutputDTO> {
    return this.http.get<RoleOutputDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAllRoles(): Observable<RoleOutputDTO[]> {
    return this.http.get<RoleOutputDTO[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  updateRole(id: number, role: RoleInputDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, role, { headers: this.getHeaders() });
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

