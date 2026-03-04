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
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  selector: 'app-vip',
  standalone: true,
  templateUrl: './vip.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    TranslatePipe
  ],
  styleUrls: ['./vip.component.scss']
})
export class VipComponent implements OnInit {
  services: SpaServiceOutputDTO[] = [];
  allLocations: LocationOutputDTO[] = [];
  employees: UserOutputDTO[] = [];
  myBookings: BookingOutputDTO[] = [];
  allBookings: BookingOutputDTO[] = [];
  bookingForm: FormGroup;
  discountPercentage = 20; // 20% discount for VIP
  currentUser: UserOutputDTO | null = null;
  formError = '';
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
    private serviceService: SpaServiceService,
    private bookingService: BookingService,
    private locationService: LocationService,
    private userService: UserService,
    private auth: AuthService,
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

  ngOnInit() {
    this.loadCurrentUser();
    this.loadServices();
    this.loadLocations();
    this.loadEmployees();
    this.loadMyBookings();

    this.bookingForm.get('serviceId')?.valueChanges.subscribe(() => this.syncLocationSelectionForService());
    this.bookingForm.get('employeeId')?.valueChanges.subscribe(() => this.clearSlotSelection());
    this.bookingForm.get('bookingDate')?.valueChanges.subscribe(() => this.clearSlotSelection());
  }

  loadServices() {
    this.serviceService.getAllServices().subscribe(data => {
      this.services = data;
    });
  }

  loadMyBookings() {
    this.bookingService.getAllBookings().subscribe(data => {
      this.allBookings = data;
      if (this.currentUser?.name) {
        this.myBookings = data.filter(booking => booking.customerName === this.currentUser?.name);
      } else {
        this.myBookings = [];
      }
    });
  }

  loadLocations() {
    this.locationService.getAllLocations().subscribe(data => {
      this.allLocations = data;
      this.syncLocationSelectionForService();
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
        this.auth.setRole(user.role || this.auth.getRole());
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
      this.formError = this.language.t('vip.completeFields');
      this.toast.error(this.formError);
      return;
    }

    const selectedSlot = this.slotPresets.find(slot => slot.value === this.bookingForm.value.timeSlot);
    const bookingDate = this.bookingForm.value.bookingDate as string;
    if (!selectedSlot || !bookingDate) {
      this.formError = this.language.t('vip.completeFields');
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
        this.loadMyBookings();
      },
      error: () => {
        this.formError = this.language.t('vip.bookingFailed');
        this.toast.error(this.formError);
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (confirm(this.language.t('vip.cancelConfirm'))) {
      this.bookingService.deleteBooking(bookingId).subscribe(() => {
        this.loadMyBookings();
      });
    }
  }

  exportPdfServices() {
    this.serviceService.downloadPriceChart().subscribe({
      next: data => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'price-chart.pdf';
        link.click();
      },
      error: () => {
        this.toast.error(this.language.t('vip.priceChartUnavailable'));
      }
    });
  }

  get canChooseSlots(): boolean {
    return Boolean(this.bookingForm.get('employeeId')?.value && this.bookingForm.get('bookingDate')?.value);
  }

  get availableLocations(): LocationOutputDTO[] {
    const selectedService = this.getSelectedService();
    if (!selectedService) {
      return this.allLocations;
    }
    if (selectedService.vipOnly) {
      return this.allLocations.filter(location => location.vipServiceAvailable);
    }
    return this.allLocations;
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

  private syncLocationSelectionForService(): void {
    const locationId = Number(this.bookingForm.get('locationId')?.value);
    if (!Number.isFinite(locationId)) {
      return;
    }
    const locationStillAllowed = this.availableLocations.some(location => location.id === locationId);
    if (!locationStillAllowed) {
      this.bookingForm.patchValue({ locationId: '' }, { emitEvent: false });
    }
  }

  private isSlotOccupied(slot: TimeSlotPreset): boolean {
    const bookingDate = this.bookingForm.get('bookingDate')?.value as string | null;
    const selectedEmployeeName = this.getSelectedEmployeeName();
    if (!bookingDate || !selectedEmployeeName) {
      return false;
    }

    const slotStart = new Date(this.buildDateTime(bookingDate, slot.start));
    const slotEnd = new Date(this.buildDateTime(bookingDate, slot.end));

    return this.allBookings.some(booking => {
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

  private getSelectedService(): SpaServiceOutputDTO | null {
    const serviceId = Number(this.bookingForm.get('serviceId')?.value);
    if (!Number.isFinite(serviceId)) {
      return null;
    }
    return this.services.find(service => service.id === serviceId) ?? null;
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
