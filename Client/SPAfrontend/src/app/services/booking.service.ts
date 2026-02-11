import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingInputDTO, BookingOutputDTO } from '../models/booking.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = '/SPA/Booking';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  createBooking(booking: BookingInputDTO): Observable<any> {
    return this.http.post(this.apiUrl, booking, { headers: this.getHeaders() });
  }

  getBookingById(id: number): Observable<BookingOutputDTO> {
    return this.http.get<BookingOutputDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAllBookings(): Observable<BookingOutputDTO[]> {
    return this.http.get<BookingOutputDTO[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  updateBooking(id: number, booking: BookingInputDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, booking, { headers: this.getHeaders() });
  }

  deleteBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
