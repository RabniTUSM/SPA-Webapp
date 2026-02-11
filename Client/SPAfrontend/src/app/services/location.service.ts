import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationInputDTO, LocationOutputDTO } from '../models/location.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private apiUrl = '/SPA/Location';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  createLocation(location: LocationInputDTO): Observable<any> {
    return this.http.post(this.apiUrl, location, { headers: this.getHeaders() });
  }

  getLocationById(id: number): Observable<LocationOutputDTO> {
    return this.http.get<LocationOutputDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAllLocations(): Observable<LocationOutputDTO[]> {
    return this.http.get<LocationOutputDTO[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  updateLocation(id: number, location: LocationInputDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, location, { headers: this.getHeaders() });
  }

  deleteLocation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
