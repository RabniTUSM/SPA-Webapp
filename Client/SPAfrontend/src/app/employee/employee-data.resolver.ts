import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BookingService } from '../services/booking.service';
import { UserService } from '../services/user.service';
import { BookingOutputDTO } from '../models/booking.model';
import { UserOutputDTO } from '../models/user.model';

export interface EmployeeResolvedData {
  users: UserOutputDTO[];
  bookings: BookingOutputDTO[];
}

@Injectable({ providedIn: 'root' })
export class EmployeeDataResolver implements Resolve<EmployeeResolvedData> {
  private userService = inject(UserService);
  private bookingService = inject(BookingService);

  resolve() {
    return forkJoin({
      users: this.userService.getAllUsers().pipe(catchError(() => of([] as UserOutputDTO[]))),
      bookings: this.bookingService.getAllBookings().pipe(catchError(() => of([] as BookingOutputDTO[])))
    });
  }
}
