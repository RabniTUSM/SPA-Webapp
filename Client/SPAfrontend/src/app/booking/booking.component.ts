import { Component, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { UserService } from '../services/user.service';
import { SpaServiceService } from '../services/spa-service.service';
import { LocationService } from '../services/location.service';
import { BookingOutputDTO, BookingInputDTO } from '../models/booking.model';
import { UserOutputDTO } from '../models/user.model';
import { SpaServiceOutputDTO } from '../models/spa-service.model';
import { LocationOutputDTO } from '../models/location.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  templateUrl: './booking.component.html',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  bookings: BookingOutputDTO[] = [];
  bookingForm: FormGroup;
  customers: UserOutputDTO[] = [];
  employees: UserOutputDTO[] = [];
  services: SpaServiceOutputDTO[] = [];
  locations: LocationOutputDTO[] = [];
  editingId: number | null = null;
  formError = '';

  constructor(
    private bookingService: BookingService,
    private userService: UserService,
    private spaService: SpaServiceService,
    private locationService: LocationService,
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

  ngOnInit(): void {
    this.loadBookings();
    this.loadUsers();
    this.loadServices();
    this.loadLocations();
  }

  loadBookings() {
    this.bookingService.getAllBookings().subscribe(data => this.bookings = data);
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(users => {
      this.employees = users.filter(user => (user.role || '').toUpperCase() === 'EMPLOYEE');
      const customers = users.filter(user => {
        const role = (user.role || '').toUpperCase();
        return role !== 'ADMIN' && role !== 'EMPLOYEE';
      });
      this.customers = customers.length ? customers : users;
    });
  }

  loadServices() {
    this.spaService.getAllServices().subscribe(data => this.services = data);
  }

  loadLocations() {
    this.locationService.getAllLocations().subscribe(data => this.locations = data);
  }

  saveBooking() {
    this.formError = '';
    if (this.bookingForm.invalid) {
      this.formError = 'Complete all required booking fields.';
      return;
    }
    const payload: BookingInputDTO = this.bookingForm.value;
    const request = this.editingId
      ? this.bookingService.updateBooking(this.editingId, payload)
      : this.bookingService.createBooking(payload);
    request.subscribe({
      next: () => {
        this.bookingForm.reset();
        this.editingId = null;
        this.loadBookings();
      },
      error: () => {
        this.formError = 'Booking save failed.';
      }
    });
  }

  editBooking(booking: BookingOutputDTO) {
    this.editingId = booking.id;
    const customer = this.customers.find(u => u.name === booking.customerName);
    const employee = this.employees.find(u => u.name === booking.employeeName);
    const service = this.services.find(s => s.name === booking.serviceName);
    const location = this.locations.find(l => l.name === booking.locationName);
    this.bookingForm.patchValue({
      customerId: customer?.id || '',
      employeeId: employee?.id || '',
      serviceId: service?.id || '',
      locationId: location?.id || '',
      startTime: this.toLocalInputValue(booking.startTime),
      endTime: this.toLocalInputValue(booking.endTime)
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.bookingForm.reset();
  }

  deleteBooking(id: number) {
    if (!confirm('Delete booking?')) return;
    this.bookingService.deleteBooking(id).subscribe(() => this.loadBookings());
  }

  private toLocalInputValue(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
