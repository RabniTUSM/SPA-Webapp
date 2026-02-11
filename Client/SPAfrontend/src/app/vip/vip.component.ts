import { Component, OnInit } from '@angular/core';
import { SpaServiceService } from '../services/spa-service.service';
import { BookingService } from '../services/booking.service';
import { UserService } from '../services/user.service';
import { LocationService } from '../services/location.service';
import { AuthService } from '../services/auth.service';
import { SpaServiceOutputDTO } from '../models/spa-service.model';
import { BookingInputDTO, BookingOutputDTO } from '../models/booking.model';
import { LocationOutputDTO } from '../models/location.model';
import { UserOutputDTO } from '../models/user.model';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-vip',
  standalone: true,
  templateUrl: './vip.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe
  ],
  styleUrls: ['./vip.component.scss']
})
export class VipComponent implements OnInit {
  services: SpaServiceOutputDTO[] = [];
  locations: LocationOutputDTO[] = [];
  employees: UserOutputDTO[] = [];
  myBookings: BookingOutputDTO[] = [];
  bookingForm: FormGroup;
  discountPercentage = 20; // 20% discount for VIP
  currentUser: UserOutputDTO | null = null;
  formError = '';

  constructor(
    private serviceService: SpaServiceService,
    private bookingService: BookingService,
    private locationService: LocationService,
    private userService: UserService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      customerId: ['', Validators.required],
      employeeId: ['', Validators.required],
      serviceId: ['', Validators.required],
      locationId: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadServices();
    this.loadLocations();
    this.loadEmployees();
    this.loadMyBookings();
  }

  loadServices() {
    this.serviceService.getAllServices().subscribe(data => {
      this.services = data;
    });
  }

  loadMyBookings() {
    this.bookingService.getAllBookings().subscribe(data => {
      if (this.currentUser?.name) {
        this.myBookings = data.filter(booking => booking.customerName === this.currentUser?.name);
      } else {
        this.myBookings = data;
      }
    });
  }

  loadLocations() {
    this.locationService.getAllLocations().subscribe(data => {
      this.locations = data.filter(location => location.vipServiceAvailable);
    });
  }

  loadEmployees() {
    this.userService.getAllUsers().subscribe(data => {
      this.employees = data.filter(user => (user.role || '').toUpperCase() === 'EMPLOYEE');
    });
  }

  loadCurrentUser() {
    const username = this.auth.getUsername();
    if (!username) return;
    this.userService.getUserByUsername(username).subscribe({
      next: user => {
        this.currentUser = user;
        this.bookingForm.patchValue({ customerId: user.id });
        this.loadMyBookings();
      },
      error: () => {
        this.currentUser = null;
      }
    });
  }

  getVipPrice(originalPrice: number): number {
    return originalPrice * (1 - this.discountPercentage / 100);
  }

  getSavings(originalPrice: number): number {
    return originalPrice - this.getVipPrice(originalPrice);
  }

  bookService() {
    this.formError = '';
    if (this.bookingForm.invalid) {
      this.formError = 'Complete all booking fields.';
      return;
    }
    const payload: BookingInputDTO = this.bookingForm.value;
    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.bookingForm.patchValue({
          employeeId: '',
          serviceId: '',
          locationId: '',
          startTime: '',
          endTime: ''
        });
        this.loadMyBookings();
      },
      error: () => {
        this.formError = 'Booking failed. Please try again.';
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (confirm('Cancel this booking?')) {
      this.bookingService.deleteBooking(bookingId).subscribe(() => {
        this.loadMyBookings();
      });
    }
  }

  exportPdfServices() {
    this.serviceService.exportServicesPdf().subscribe(data => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'spa_services.pdf';
      link.click();
    });
  }
}
