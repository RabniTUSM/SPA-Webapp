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
import { TranslatePipe } from '../pipes/t.pipe';
import { LanguageService } from '../services/language.service';
import { ToastService } from '../services/toast.service';

interface TimeSlotPreset {
  value: string;
  label: string;
  start: string;
  end: string;
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe, TranslatePipe],
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
  isGuest = false;
  readonly minBookingDate = this.getTodayDate();

  private readonly slotPresets: TimeSlotPreset[] = [
    { value: '09:00-10:00', label: '09:00 - 10:00', start: '09:00', end: '10:00' },
    { value: '10:30-11:30', label: '10:30 - 11:30', start: '10:30', end: '11:30' },
    { value: '12:00-13:00', label: '12:00 - 13:00', start: '12:00', end: '13:00' },
    { value: '13:30-14:30', label: '13:30 - 14:30', start: '13:30', end: '14:30' },
    { value: '15:00-16:00', label: '15:00 - 16:00', start: '15:00', end: '16:00' },
    { value: '16:30-17:30', label: '16:30 - 17:30', start: '16:30', end: '17:30' },
    { value: '18:00-19:00', label: '18:00 - 19:00', start: '18:00', end: '19:00' }
  ];

  constructor(
    private bookingService: BookingService,
    private spaService: SpaServiceService,
    private locationService: LocationService,
    private userService: UserService,
    private auth: AuthService,
    private vipRequests: VipRequestService,
    private roleView: RoleViewService,
    private fb: FormBuilder,
    private language: LanguageService,
    private toast: ToastService
  ) {
    this.bookingForm = this.fb.group({
      customerId: ['', Validators.required],
      employeeId: ['', Validators.required],
      serviceId: ['', Validators.required],
      locationId: ['', Validators.required],
      bookingDate: ['', Validators.required],
      timeSlot: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadServices();
    this.loadLocations();
    if (!this.isGuest) {
      this.loadEmployees();
      this.loadBookings();
    }
    this.refreshVipStatus();

    this.bookingForm.get('employeeId')?.valueChanges.subscribe(() => this.clearSlotSelection());
    this.bookingForm.get('bookingDate')?.valueChanges.subscribe(() => this.clearSlotSelection());
  }

  private loadCurrentUser() {
    const username = this.auth.getUsername();
    if (!username || username === 'guest') {
      this.isGuest = username === 'guest';
      this.currentUser = null;
      this.bookingForm.patchValue({ customerId: '' });
      this.refreshVipStatus();
      return;
    }
    this.userService.getUserByUsername(username).subscribe({
      next: user => {
        this.currentUser = user;
        this.auth.setRole(user.role || this.auth.getRole());
        this.bookingForm.patchValue({ customerId: user.id });
        this.filterBookings();
        this.refreshVipStatus();
      },
      error: () => {
        this.currentUser = null;
        this.refreshVipStatus();
      }
    });
  }

  private loadServices() {
    this.spaService.getAllServices().subscribe({
      next: services => this.services = services.filter(service => !service.vipOnly),
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
    if (this.isGuest) {
      this.myBookings = [];
      return;
    }
    if (this.currentUser?.name) {
      this.myBookings = this.bookings.filter(booking => booking.customerName === this.currentUser?.name);
    } else {
      this.myBookings = [];
    }
  }

  createBooking() {
    this.formError = '';
    if (this.isGuest || !this.currentUser) {
      this.formError = this.language.t('customer.errorGuestBooking');
      this.toast.error(this.formError);
      return;
    }
    if (this.bookingForm.invalid) {
      this.formError = this.language.t('customer.errorRequired');
      this.toast.error(this.formError);
      return;
    }

    const selectedSlot = this.slotPresets.find(slot => slot.value === this.bookingForm.value.timeSlot);
    const bookingDate = this.bookingForm.value.bookingDate as string;

    if (!selectedSlot || !bookingDate) {
      this.formError = this.language.t('customer.errorRequired');
      this.toast.error(this.formError);
      return;
    }

    const payload: BookingInputDTO = {
      customerId: Number(this.bookingForm.value.customerId),
      employeeId: Number(this.bookingForm.value.employeeId),
      serviceId: Number(this.bookingForm.value.serviceId),
      locationId: Number(this.bookingForm.value.locationId),
      startTime: this.buildDateTime(bookingDate, selectedSlot.start),
      endTime: this.buildDateTime(bookingDate, selectedSlot.end)
    };

    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.toast.success(this.language.t('customer.bookingCreated'));
        this.bookingForm.patchValue({
          employeeId: '',
          serviceId: '',
          locationId: '',
          bookingDate: '',
          timeSlot: ''
        });
        this.loadBookings();
      },
      error: () => {
        this.formError = this.language.t('customer.errorBookingFailed');
        this.toast.error(this.formError);
      }
    });
  }

  cancelBooking(id: number) {
    if (!confirm(this.language.t('customer.confirmCancel'))) return;
    this.bookingService.deleteBooking(id).subscribe(() => this.loadBookings());
  }

  submitVipRequest() {
    this.vipError = '';
    if (!this.currentUser) {
      this.vipError = this.language.t('customer.errorVipLogin');
      return;
    }
    if (!this.vipRequestNote.trim()) {
      this.vipError = this.language.t('customer.errorVipNote');
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
    const role = this.currentUser?.role || this.auth.getRole();
    const view = this.roleView.getRoleView(role, username);
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

  get canChooseSlots(): boolean {
    return Boolean(this.bookingForm.get('employeeId')?.value && this.bookingForm.get('bookingDate')?.value);
  }

  get timetableSlots(): Array<TimeSlotPreset & { unavailable: boolean; reason: 'occupied' | 'past' | null }> {
    return this.slotPresets.map(slot => {
      const past = this.isSlotInPast(slot);
      const occupied = !past && this.isSlotOccupied(slot);
      return {
        ...slot,
        unavailable: past || occupied,
        reason: past ? 'past' : occupied ? 'occupied' : null
      };
    });
  }

  selectTimeSlot(slotValue: string): void {
    const currentValue = this.bookingForm.get('timeSlot')?.value as string | null;
    if (currentValue === slotValue) {
      this.bookingForm.patchValue({ timeSlot: '' });
      return;
    }

    const slot = this.slotPresets.find(item => item.value === slotValue);
    if (!slot || this.isSlotInPast(slot) || this.isSlotOccupied(slot)) {
      return;
    }
    this.bookingForm.patchValue({ timeSlot: slotValue });
  }

  private clearSlotSelection(): void {
    this.bookingForm.patchValue({ timeSlot: '' }, { emitEvent: false });
  }

  private isSlotOccupied(slot: TimeSlotPreset): boolean {
    const bookingDate = this.bookingForm.get('bookingDate')?.value as string | null;
    const selectedEmployeeName = this.getSelectedEmployeeName();

    if (!bookingDate || !selectedEmployeeName) {
      return false;
    }

    const slotStart = new Date(this.buildDateTime(bookingDate, slot.start));
    const slotEnd = new Date(this.buildDateTime(bookingDate, slot.end));

    return this.bookings.some(booking => {
      if (booking.employeeName !== selectedEmployeeName) {
        return false;
      }
      if (!booking.startTime.startsWith(bookingDate)) {
        return false;
      }
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  private isSlotInPast(slot: TimeSlotPreset): boolean {
    const bookingDate = this.bookingForm.get('bookingDate')?.value as string | null;
    if (!bookingDate) {
      return false;
    }
    const slotEnd = new Date(this.buildDateTime(bookingDate, slot.end));
    return slotEnd.getTime() <= Date.now();
  }

  private getSelectedEmployeeName(): string | null {
    const employeeId = Number(this.bookingForm.get('employeeId')?.value);
    if (!Number.isFinite(employeeId)) {
      return null;
    }
    return this.employees.find(employee => employee.id === employeeId)?.name ?? null;
  }

  private buildDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
