import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { SpaServiceService } from '../services/spa-service.service';
import { LocationService } from '../services/location.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { VipRequestService } from '../services/vip-request.service';
import { RoleViewService } from '../services/role-view.service';
import { BookingInputDTO, BookingOutputDTO } from '../models/booking.model';
import { SpaServiceOutputDTO } from '../models/spa-service.model';
import { LocationOutputDTO } from '../models/location.model';
import { UserOutputDTO } from '../models/user.model';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  bookingForm: FormGroup;
  services: SpaServiceOutputDTO[] = [];
  locations: LocationOutputDTO[] = [];
  employees: UserOutputDTO[] = [];
  bookings: BookingOutputDTO[] = [];
  myBookings: BookingOutputDTO[] = [];
  currentUser: UserOutputDTO | null = null;
  formError = '';
  vipError = '';
  vipRequestNote = '';
  vipStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';

  constructor(
    private bookingService: BookingService,
    private spaService: SpaServiceService,
    private locationService: LocationService,
    private userService: UserService,
    private auth: AuthService,
    private vipRequests: VipRequestService,
    private roleView: RoleViewService,
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
    this.loadCurrentUser();
    this.loadServices();
    this.loadLocations();
    this.loadEmployees();
    this.loadBookings();
    this.refreshVipStatus();
  }

  private loadCurrentUser() {
    const username = this.auth.getUsername();
    if (!username) {
      return;
    }
    this.userService.getUserByUsername(username).subscribe({
      next: user => {
        this.currentUser = user;
        this.bookingForm.patchValue({ customerId: user.id });
        this.filterBookings();
      },
      error: () => {
        this.currentUser = null;
      }
    });
  }

  private loadServices() {
    this.spaService.getAllServices().subscribe({
      next: services => this.services = services.filter(service => !service.isVipOnly),
      error: () => this.services = []
    });
  }

  private loadLocations() {
    this.locationService.getAllLocations().subscribe({
      next: locations => this.locations = locations,
      error: () => this.locations = []
    });
  }

  private loadEmployees() {
    this.userService.getAllUsers().subscribe({
      next: users => {
        this.employees = users.filter(user => (user.role || '').toUpperCase() === 'EMPLOYEE');
      },
      error: () => this.employees = []
    });
  }

  private loadBookings() {
    this.bookingService.getAllBookings().subscribe({
      next: bookings => {
        this.bookings = bookings;
        this.filterBookings();
      },
      error: () => {
        this.bookings = [];
        this.myBookings = [];
      }
    });
  }

  private filterBookings() {
    if (this.currentUser?.name) {
      this.myBookings = this.bookings.filter(booking => booking.customerName === this.currentUser?.name);
    } else {
      this.myBookings = this.bookings;
    }
  }

  createBooking() {
    this.formError = '';
    if (this.bookingForm.invalid) {
      this.formError = 'Please complete all required fields.';
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
        this.loadBookings();
      },
      error: () => {
        this.formError = 'Booking failed. Please try again.';
      }
    });
  }

  cancelBooking(id: number) {
    if (!confirm('Cancel this reservation?')) return;
    this.bookingService.deleteBooking(id).subscribe(() => this.loadBookings());
  }

  submitVipRequest() {
    this.vipError = '';
    if (!this.currentUser) {
      this.vipError = 'You must be logged in to apply for VIP.';
      return;
    }
    if (!this.vipRequestNote.trim()) {
      this.vipError = 'Add a short note to your VIP application.';
      return;
    }
    this.vipRequests.submitRequest(
      this.auth.getUsername() || this.currentUser.username,
      this.currentUser.name,
      this.vipRequestNote.trim()
    );
    this.vipRequestNote = '';
    this.refreshVipStatus();
  }

  private refreshVipStatus() {
    const username = this.auth.getUsername();
    const view = this.roleView.getRoleView(this.auth.getRole(), username);
    if (view === 'vip') {
      this.vipStatus = 'approved';
      return;
    }
    if (!username) {
      this.vipStatus = 'none';
      return;
    }
    const requests = this.vipRequests.getRequests().filter(req => req.username === username);
    const approved = requests.find(req => req.status === 'approved');
    const pending = requests.find(req => req.status === 'pending');
    const rejected = requests.find(req => req.status === 'rejected');
    if (approved) {
      this.vipStatus = 'approved';
    } else if (pending) {
      this.vipStatus = 'pending';
    } else if (rejected) {
      this.vipStatus = 'rejected';
    } else {
      this.vipStatus = 'none';
    }
  }
}
