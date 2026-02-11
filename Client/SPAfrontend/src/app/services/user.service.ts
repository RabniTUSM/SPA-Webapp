import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInputDTO, UserOutputDTO, CreateAdminDTO, AdminUserInputDTO } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/SPA/User';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  register(user: UserInputDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  createAdmin(admin: CreateAdminDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin`, admin, { headers: this.getHeaders() });
  }

  adminSaveUser(adminUser: AdminUserInputDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/user`, adminUser, { headers: this.getHeaders() });
  }

  getUserByUsername(username: string): Observable<UserOutputDTO> {
    return this.http.get<UserOutputDTO>(`${this.apiUrl}/${username}`, { headers: this.getHeaders() });
  }

  getAllUsers(): Observable<UserOutputDTO[]> {
    return this.http.get<UserOutputDTO[]>(`${this.apiUrl}/allUsers`, { headers: this.getHeaders() });
  }

  updateUser(username: string, user: UserInputDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${username}`, user, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
