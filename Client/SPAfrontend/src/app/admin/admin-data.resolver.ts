import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RoleService } from '../services/role.service';
import { UserService } from '../services/user.service';
import { BookingService } from '../services/booking.service';
import { SpaServiceService } from '../services/spa-service.service';
import { LocationService } from '../services/location.service';
import { RoleOutputDTO } from '../models/role.model';
import { UserOutputDTO } from '../models/user.model';
import { BookingOutputDTO } from '../models/booking.model';
import { SpaServiceOutputDTO } from '../models/spa-service.model';
import { LocationOutputDTO } from '../models/location.model';

export interface AdminResolvedData {
  roles: RoleOutputDTO[];
  users: UserOutputDTO[];
  bookings: BookingOutputDTO[];
  services: SpaServiceOutputDTO[];
  locations: LocationOutputDTO[];
}

@Injectable({ providedIn: 'root' })
export class AdminDataResolver implements Resolve<AdminResolvedData> {
  private roleService = inject(RoleService);
  private userService = inject(UserService);
  private bookingService = inject(BookingService);
  private spaService = inject(SpaServiceService);
  private locationService = inject(LocationService);

  resolve() {
    return forkJoin({
      roles: this.roleService.getAllRoles().pipe(catchError(() => of([] as RoleOutputDTO[]))),
      users: this.userService.getAllUsers().pipe(catchError(() => of([] as UserOutputDTO[]))),
      bookings: this.bookingService.getAllBookings().pipe(catchError(() => of([] as BookingOutputDTO[]))),
      services: this.spaService.getAllServices().pipe(catchError(() => of([] as SpaServiceOutputDTO[]))),
      locations: this.locationService.getAllLocations().pipe(catchError(() => of([] as LocationOutputDTO[])))
    });
  }
}
