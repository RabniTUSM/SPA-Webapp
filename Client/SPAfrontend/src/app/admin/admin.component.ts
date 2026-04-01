import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { RoleViewService, RoleView } from '../services/role-view.service';
import { VipRequestService, VipRequest } from '../services/vip-request.service';
import { BookingService } from '../services/booking.service';
import { SpaServiceService } from '../services/spa-service.service';
import { LocationService } from '../services/location.service';
import { ToastService } from '../services/toast.service';
import { LanguageService } from '../services/language.service';
import { TranslatePipe } from '../pipes/t.pipe';
import { UserOutputDTO, CreateAdminDTO, AdminUserInputDTO } from '../models/user.model';
import { RoleOutputDTO, RoleInputDTO } from '../models/role.model';
import { BookingInputDTO, BookingOutputDTO } from '../models/booking.model';
import { SpaServiceInputDTO, SpaServiceOutputDTO } from '../models/spa-service.model';
import { LocationInputDTO, LocationOutputDTO } from '../models/location.model';
import { AdminResolvedData } from './admin-data.resolver';

type AdminTab = 'roles' | 'users' | 'bookings' | 'services' | 'locations' | 'vip' | 'admins';

interface TimeSlotPreset {
  value: string;
  label: string;
  start: string;
  end: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [CommonModule, ReactiveFormsModule, DatePipe, TranslatePipe],
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab: AdminTab = 'roles';

  roles: RoleOutputDTO[] = [];
  users: UserOutputDTO[] = [];
  bookings: BookingOutputDTO[] = [];
  services: SpaServiceOutputDTO[] = [];
  locations: LocationOutputDTO[] = [];
  availableBookingLocations: LocationOutputDTO[] = [];
  customers: UserOutputDTO[] = [];
  employees: UserOutputDTO[] = [];
  vipRequests: VipRequest[] = [];

  roleViewMap: Record<string, RoleView> = {};
  readonly roleViewOptions: RoleView[] = ['customer', 'vip', 'employee', 'admin'];
  readonly minBookingDate = this.getTodayDate();
  isLoading = false;

  showRoleForm = false;
  editingRoleId: number | null = null;
  editingBookingId: number | null = null;
  editingServiceId: number | null = null;
  editingLocationId: number | null = null;
  editingUsername: string | null = null;
  selectedPriceChartFile: File | null = null;
  isCreatingUser = false;

  roleForm: FormGroup;
  adminForm: FormGroup;
  userEditForm: FormGroup;
  bookingForm: FormGroup;
  serviceForm: FormGroup;
  locationForm: FormGroup;

  roleFormError = '';
  adminFormError = '';
  userEditError = '';
  bookingFormError = '';
  serviceFormError = '';
  locationFormError = '';
  private readonly autoRefreshMs = 12000;
  private autoRefreshId: number | null = null;
  private lastRefreshAt = 0;
  private warmupEnabled = true;
  private warmupAttempts = 0;
  private readonly warmupMaxAttempts = 10;
  private warmupTimeoutId: number | null = null;
  private pendingForcedRefresh = false;
  private readonly onWindowFocus = () => this.refreshAll();
  private readonly onVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.refreshAll();
    }
  };

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
    private userService: UserService,
    private roleService: RoleService,
    private roleView: RoleViewService,
    private vipRequestService: VipRequestService,
    private bookingService: BookingService,
    private spaService: SpaServiceService,
    private locationService: LocationService,
    private toast: ToastService,
    private language: LanguageService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      hasAdminAccess: [false],
      description: [''],
      viewType: ['customer', Validators.required]
    });

    this.adminForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.userEditForm = this.fb.group({
      username: ['', Validators.required],
      password: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['', Validators.required]
    });

    this.bookingForm = this.fb.group({
      customerId: ['', Validators.required],
      employeeId: ['', Validators.required],
      serviceId: ['', Validators.required],
      locationId: ['', Validators.required],
      bookingDate: ['', Validators.required],
      timeSlot: ['', Validators.required]
    });

    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      vipOnly: [false]
    });

    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      vipServiceAvailable: [false]
    });
  }

  ngOnInit(): void {
    const resolved: AdminResolvedData | undefined = this.route.snapshot.data['adminData'];
    if (resolved) {
      this.applyData(resolved);
      const hasCoreData = resolved.roles.length > 0 && resolved.users.length > 0;
      this.warmupEnabled = !hasCoreData;
      this.lastRefreshAt = Date.now();
      if (!hasCoreData) {
        this.refreshAll(true);
        this.scheduleWarmupRefresh(500);
      }
    } else {
      this.refreshAll(true);
      this.scheduleWarmupRefresh(500);
    }
    if (typeof window !== 'undefined') {
      this.autoRefreshId = window.setInterval(() => this.refreshAll(), this.autoRefreshMs);
      window.addEventListener('focus', this.onWindowFocus);
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
    this.bookingForm.get('employeeId')?.valueChanges.subscribe(() => this.clearBookingSlotSelection());
    this.bookingForm.get('bookingDate')?.valueChanges.subscribe(() => this.clearBookingSlotSelection());
    this.bookingForm.get('serviceId')?.valueChanges.subscribe(() => this.updateAvailableBookingLocations());
  }

  ngOnDestroy(): void {
    if (this.autoRefreshId !== null) {
      clearInterval(this.autoRefreshId);
      this.autoRefreshId = null;
    }
    this.clearWarmupRefresh();
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.onWindowFocus);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  t(key: string): string {
    return this.language.t(key);
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.refreshAll(true);
  }

  refreshAll(force = false): void {
    if (this.isLoading) {
      if (force) {
        this.pendingForcedRefresh = true;
      }
      return;
    }
    const stale = Date.now() - this.lastRefreshAt > this.autoRefreshMs;
    if (!force && this.lastRefreshAt > 0 && !stale) {
      return;
    }
    this.isLoading = true;
    const hadErrors = { value: false };

    forkJoin({
      roles: this.roleService.getAllRoles().pipe(
        catchError(() => {
          hadErrors.value = true;
          return of([] as RoleOutputDTO[]);
        })
      ),
      users: this.userService.getAllUsers().pipe(
        catchError(() => {
          hadErrors.value = true;
          return of([] as UserOutputDTO[]);
        })
      ),
      bookings: this.bookingService.getAllBookings().pipe(
        catchError(() => {
          hadErrors.value = true;
          return of([] as BookingOutputDTO[]);
        })
      ),
      services: this.spaService.getAllServices().pipe(
        catchError(() => {
          hadErrors.value = true;
          return of([] as SpaServiceOutputDTO[]);
        })
      ),
      locations: this.locationService.getAllLocations().pipe(
        catchError(() => {
          hadErrors.value = true;
          return of([] as LocationOutputDTO[]);
        })
      ),
      vipRequests: this.vipRequestService.getPendingRequests().pipe(
        catchError(() => {
          hadErrors.value = true;
          return of([] as VipRequest[]);
        })
      )
    }).subscribe({
      next: result => {
        this.applyData(result);
        if (hadErrors.value) {
          this.toast.error(this.t('admin.partialLoad'));
        }
      },
      error: () => {
        this.toast.error(this.t('admin.partialLoad'));
      },
      complete: () => {
        this.isLoading = false;
        this.handleWarmupAfterRefresh();
        if (this.pendingForcedRefresh) {
          this.pendingForcedRefresh = false;
          this.refreshAll(true);
        }
      }
    });
  }

  toggleRoleForm(): void {
    this.showRoleForm = !this.showRoleForm;
    this.editingRoleId = null;
    this.roleFormError = '';
    this.roleForm.reset({
      name: '',
      hasAdminAccess: false,
      description: '',
      viewType: 'customer'
    });
  }

  editRole(role: RoleOutputDTO): void {
    this.editingRoleId = role.id;
    this.showRoleForm = true;
    this.roleFormError = '';
    this.roleForm.patchValue({
      name: role.name,
      hasAdminAccess: role.hasAdminAccess,
      description: role.description || '',
      viewType: role.viewType || this.getViewForRole(role.name)
    });
    this.activeTab = 'roles';
  }

  saveRole(): void {
    this.roleFormError = '';
    if (this.roleForm.invalid) {
      this.roleFormError = this.t('admin.requiredRoleFields');
      return;
    }

    const payload: RoleInputDTO = {
      name: this.roleForm.value.name,
      hasAdminAccess: this.roleForm.value.hasAdminAccess,
      description: this.roleForm.value.description || '',
      viewType: this.roleForm.value.viewType
    };

    const request = this.editingRoleId
      ? this.roleService.updateRole(this.editingRoleId, payload)
      : this.roleService.createRole(payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.t('admin.roleSaved'));
        this.toggleRoleForm();
        this.refreshAll(true);
      },
      error: () => {
        this.roleFormError = this.t('admin.roleSaveFailed');
        this.toast.error(this.roleFormError);
      }
    });
  }

  getViewForRole(roleName: string): RoleView {
    const direct = this.roleViewMap[roleName];
    if (direct) {
      return direct;
    }
    const lowered = roleName.toLowerCase();
    const match = Object.keys(this.roleViewMap).find(key => key.toLowerCase() === lowered);
    return match ? this.roleViewMap[match] : 'customer';
  }

  deleteRole(id: number): void {
    if (!confirm(this.t('admin.areYouSure'))) {
      return;
    }
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.toast.success(this.t('admin.roleDeleted'));
        this.refreshAll(true);
      },
      error: () => this.toast.error(this.t('admin.roleDeleteFailed'))
    });
  }

  openUserEdit(user: UserOutputDTO): void {
    this.userEditError = '';
    this.isCreatingUser = false;
    this.setPasswordOptional();
    this.editingUsername = user.username;
    this.userEditForm.patchValue({
      username: user.username,
      password: '',
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    this.activeTab = 'users';
  }

  openUserCreate(): void {
    this.userEditError = '';
    this.isCreatingUser = true;
    this.editingUsername = null;
    this.setPasswordRequired();
    this.userEditForm.reset({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: ''
    });
    this.activeTab = 'users';
  }

  cancelUserEdit(): void {
    this.editingUsername = null;
    this.isCreatingUser = false;
    this.userEditError = '';
    this.userEditForm.reset({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: ''
    });
  }

  saveUserEdit(): void {
    this.userEditError = '';
    if (this.userEditForm.invalid) {
      this.userEditError = this.t('admin.completeUserFields');
      return;
    }

    const value = this.userEditForm.getRawValue();
    if (this.isCreatingUser && !value.password) {
      this.userEditError = this.t('admin.completeUserFields');
      return;
    }

    const payload: AdminUserInputDTO = {
      username: value.username,
      password: value.password || '',
      name: value.name,
      email: value.email,
      phone: value.phone || '',
      role: value.role
    };

    this.userService.adminSaveUser(payload).subscribe({
      next: () => {
        this.toast.success(this.t('admin.userSaved'));
        this.cancelUserEdit();
        this.refreshAll(true);
      },
      error: err => {
        const backendMessage = this.extractBackendMessage(err);
        this.userEditError = backendMessage || this.t('admin.userSaveFailed');
        this.toast.error(this.userEditError);
      }
    });
  }

  deleteUser(id: number): void {
    if (!confirm(this.t('admin.areYouSure'))) {
      return;
    }
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.toast.success(this.t('admin.userDeleted'));
        this.refreshAll(true);
      },
      error: () => this.toast.error(this.t('admin.userDeleteFailed'))
    });
  }

  private setPasswordRequired(): void {
    const ctrl = this.userEditForm.get('password');
    if (!ctrl) return;
    ctrl.setValidators([Validators.required, Validators.minLength(6)]);
    ctrl.updateValueAndValidity();
  }

  private setPasswordOptional(): void {
    const ctrl = this.userEditForm.get('password');
    if (!ctrl) return;
    ctrl.clearValidators();
    ctrl.updateValueAndValidity();
  }

  createAdmin(): void {
    this.adminFormError = '';
    if (this.adminForm.invalid) {
      this.adminFormError = this.t('admin.completeAdminFields');
      return;
    }

    const payload: CreateAdminDTO = this.adminForm.value;
    this.userService.createAdmin(payload).subscribe({
      next: () => {
        this.toast.success(this.t('admin.adminCreated'));
        this.adminForm.reset();
        this.refreshAll(true);
      },
      error: err => {
        this.adminFormError = this.extractBackendMessage(err) || this.t('admin.createAdminFailed');
        this.toast.error(this.adminFormError);
      }
    });
  }

  approveVip(request: VipRequest): void {
    this.vipRequestService.approveRequest(request.id).subscribe({
      next: () => {
        this.toast.success(this.t('admin.vipApprovedToast'));
        this.refreshAll(true);
      },
      error: err => {
        const message = this.extractBackendMessage(err) || this.t('admin.userSaveFailed');
        this.toast.error(message);
      }
    });
  }

  rejectVip(request: VipRequest): void {
    this.vipRequestService.rejectRequest(request.id).subscribe({
      next: () => {
        this.toast.success(this.t('admin.vipRejectedToast'));
        this.refreshAll(true);
      },
      error: err => {
        const message = this.extractBackendMessage(err) || this.t('admin.userSaveFailed');
        this.toast.error(message);
      }
    });
  }

  saveBooking(): void {
    this.bookingFormError = '';
    if (this.bookingForm.invalid) {
      this.bookingFormError = this.t('admin.completeBookingFields');
      return;
    }

    const selectedSlot = this.slotPresets.find(slot => slot.value === this.bookingForm.value.timeSlot);
    const bookingDate = this.bookingForm.value.bookingDate as string;
    if (!selectedSlot || !bookingDate) {
      this.bookingFormError = this.t('admin.completeBookingFields');
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

    const request = this.editingBookingId
      ? this.bookingService.updateBooking(this.editingBookingId, payload)
      : this.bookingService.createBooking(payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.t('admin.bookingSaved'));
        this.resetBookingForm();
        this.refreshAll(true);
      },
      error: () => {
        this.bookingFormError = this.t('admin.bookingSaveFailed');
        this.toast.error(this.bookingFormError);
      }
    });
  }

  editBooking(booking: BookingOutputDTO): void {
    this.editingBookingId = booking.id;
    this.bookingFormError = '';

    const customerId = this.customers.find(user => user.name === booking.customerName)?.id ?? '';
    const employeeId = this.employees.find(user => user.name === booking.employeeName)?.id ?? '';
    const serviceId = this.services.find(service => service.name === booking.serviceName)?.id ?? '';
    const locationId = this.locations.find(location => location.name === booking.locationName)?.id ?? '';

    this.bookingForm.patchValue({
      customerId,
      employeeId,
      serviceId,
      locationId,
      bookingDate: this.toDateOnly(booking.startTime),
      timeSlot: this.resolveSlotValue(booking.startTime, booking.endTime)
    });
    this.updateAvailableBookingLocations();

    this.activeTab = 'bookings';
  }

  deleteBooking(id: number): void {
    if (!confirm(this.t('admin.confirmDeleteBooking'))) {
      return;
    }
    this.bookingService.deleteBooking(id).subscribe({
      next: () => {
        this.toast.success(this.t('admin.bookingDeleted'));
        this.refreshAll(true);
      },
      error: () => this.toast.error(this.t('admin.bookingDeleteFailed'))
    });
  }

  resetBookingForm(): void {
    this.editingBookingId = null;
    this.bookingFormError = '';
    this.bookingForm.reset({
      customerId: '',
      employeeId: '',
      serviceId: '',
      locationId: '',
      bookingDate: '',
      timeSlot: ''
    });
    this.updateAvailableBookingLocations();
  }

  get bookingCanChooseSlots(): boolean {
    return Boolean(this.bookingForm.get('employeeId')?.value && this.bookingForm.get('bookingDate')?.value);
  }

  get bookingTimeSlots(): Array<TimeSlotPreset & { unavailable: boolean; reason: 'occupied' | 'past' | null }> {
    return this.slotPresets.map(slot => {
      const past = this.isBookingSlotInPast(slot);
      const occupied = !past && this.isBookingSlotOccupied(slot);
      return {
        ...slot,
        unavailable: past || occupied,
        reason: past ? 'past' : occupied ? 'occupied' : null
      };
    });
  }

  selectBookingSlot(slotValue: string): void {
    const currentValue = this.bookingForm.get('timeSlot')?.value as string | null;
    if (currentValue === slotValue) {
      this.bookingForm.patchValue({ timeSlot: '' });
      return;
    }

    const slot = this.slotPresets.find(item => item.value === slotValue);
    if (!slot || this.isBookingSlotInPast(slot) || this.isBookingSlotOccupied(slot)) {
      return;
    }
    this.bookingForm.patchValue({ timeSlot: slotValue });
  }

  saveService(): void {
    this.serviceFormError = '';
    if (this.serviceForm.invalid) {
      this.serviceFormError = this.t('admin.completeServiceFields');
      return;
    }

    const payload: SpaServiceInputDTO = this.serviceForm.value;
    const request = this.editingServiceId
      ? this.spaService.updateService(this.editingServiceId, payload)
      : this.spaService.createService(payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.t('admin.serviceSaved'));
        this.cancelServiceEdit();
        this.refreshAll(true);
      },
      error: () => {
        this.serviceFormError = this.t('admin.serviceSaveFailed');
        this.toast.error(this.serviceFormError);
      }
    });
  }

  editService(service: SpaServiceOutputDTO): void {
    this.editingServiceId = service.id;
    this.serviceFormError = '';
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description || '',
      price: service.price,
      vipOnly: service.vipOnly
    });
    this.activeTab = 'services';
  }

  cancelServiceEdit(): void {
    this.editingServiceId = null;
    this.serviceFormError = '';
    this.serviceForm.reset({
      name: '',
      description: '',
      price: 0,
      vipOnly: false
    });
  }

  deleteService(id: number): void {
    if (!confirm(this.t('admin.confirmDeleteService'))) {
      return;
    }
    this.spaService.deleteService(id).subscribe({
      next: () => {
        this.toast.success(this.t('admin.serviceDeleted'));
        this.refreshAll(true);
      },
      error: () => this.toast.error(this.t('admin.serviceDeleteFailed'))
    });
  }

  onPriceChartFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;
    if (!file) {
      this.selectedPriceChartFile = null;
      return;
    }
    const fileName = file.name.toLowerCase();
    const isPdf = file.type.toLowerCase().includes('pdf') || fileName.endsWith('.pdf');
    if (!isPdf) {
      this.selectedPriceChartFile = null;
      if (input) {
        input.value = '';
      }
      this.toast.error(this.t('admin.priceChartOnlyPdf'));
      return;
    }
    this.selectedPriceChartFile = file;
  }

  uploadPriceChart(): void {
    if (!this.selectedPriceChartFile) {
      this.toast.error(this.t('admin.priceChartPickFile'));
      return;
    }
    this.spaService.uploadPriceChart(this.selectedPriceChartFile).subscribe({
      next: () => {
        this.toast.success(this.t('admin.priceChartUploadSuccess'));
        this.selectedPriceChartFile = null;
      },
      error: err => {
        const message = this.extractBackendMessage(err) || this.t('admin.priceChartUploadFailed');
        this.toast.error(message);
      }
    });
  }

  downloadPriceChart(): void {
    this.spaService.downloadPriceChart().subscribe({
      next: data => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'price-chart.pdf';
        link.click();
      },
      error: () => {
        this.toast.error(this.t('admin.priceChartNotFound'));
      }
    });
  }

  saveLocation(): void {
    this.locationFormError = '';
    if (this.locationForm.invalid) {
      this.locationFormError = this.t('admin.completeLocationFields');
      return;
    }

    const payload: LocationInputDTO = this.locationForm.value;
    const request = this.editingLocationId
      ? this.locationService.updateLocation(this.editingLocationId, payload)
      : this.locationService.createLocation(payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.t('admin.locationSaved'));
        this.cancelLocationEdit();
        this.refreshAll(true);
      },
      error: () => {
        this.locationFormError = this.t('admin.locationSaveFailed');
        this.toast.error(this.locationFormError);
      }
    });
  }

  editLocation(location: LocationOutputDTO): void {
    this.editingLocationId = location.id;
    this.locationFormError = '';
    this.locationForm.patchValue({
      name: location.name,
      address: location.address || '',
      vipServiceAvailable: location.vipServiceAvailable
    });
    this.activeTab = 'locations';
  }

  cancelLocationEdit(): void {
    this.editingLocationId = null;
    this.locationFormError = '';
    this.locationForm.reset({
      name: '',
      address: '',
      vipServiceAvailable: false
    });
  }

  deleteLocation(id: number): void {
    if (!confirm(this.t('admin.confirmDeleteLocation'))) {
      return;
    }
    this.locationService.deleteLocation(id).subscribe({
      next: () => {
        this.toast.success(this.t('admin.locationDeleted'));
        this.refreshAll(true);
      },
      error: () => this.toast.error(this.t('admin.locationDeleteFailed'))
    });
  }

  private clearBookingSlotSelection(): void {
    this.bookingForm.patchValue({ timeSlot: '' }, { emitEvent: false });
  }

  private updateAvailableBookingLocations(): void {
    const serviceId = Number(this.bookingForm.get('serviceId')?.value);
    const selectedService = this.services.find(service => service.id === serviceId);
    const vipOnly = Boolean(selectedService?.vipOnly);

    this.availableBookingLocations = vipOnly
      ? this.locations.filter(location => Boolean(location.vipServiceAvailable))
      : [...this.locations];

    const selectedLocationId = Number(this.bookingForm.get('locationId')?.value);
    const hasValidSelection = this.availableBookingLocations.some(location => location.id === selectedLocationId);
    if (!hasValidSelection) {
      this.bookingForm.patchValue({ locationId: '' }, { emitEvent: false });
    }
  }

  private isBookingSlotOccupied(slot: TimeSlotPreset): boolean {
    const bookingDate = this.bookingForm.get('bookingDate')?.value as string | null;
    const employeeName = this.getSelectedEmployeeName();
    if (!bookingDate || !employeeName) {
      return false;
    }

    const slotStart = new Date(this.buildDateTime(bookingDate, slot.start));
    const slotEnd = new Date(this.buildDateTime(bookingDate, slot.end));

    return this.bookings.some(booking => {
      if (this.editingBookingId && booking.id === this.editingBookingId) {
        return false;
      }
      if (booking.employeeName !== employeeName) {
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

  private isBookingSlotInPast(slot: TimeSlotPreset): boolean {
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

  private resolveSlotValue(startTime: string, endTime: string): string {
    const start = this.extractTime(startTime);
    const end = this.extractTime(endTime);
    const slot = this.slotPresets.find(item => item.start === start && item.end === end);
    return slot?.value ?? '';
  }

  private extractTime(value: string): string {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    const timePart = value.split('T')[1] || '';
    return timePart.slice(0, 5);
  }

  private toDateOnly(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.split('T')[0] || '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private extractBackendMessage(err: any): string {
    if (typeof err?.error === 'string') {
      return err.error;
    }
    if (typeof err?.error?.message === 'string') {
      return err.error.message;
    }
    if (typeof err?.error?.error === 'string') {
      return err.error.error;
    }
    return '';
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private handleWarmupAfterRefresh(): void {
    if (!this.warmupEnabled) {
      return;
    }
    if (this.roles.length > 0 || this.users.length > 0) {
      this.warmupEnabled = false;
      this.clearWarmupRefresh();
      return;
    }
    this.scheduleWarmupRefresh(800);
  }

  private scheduleWarmupRefresh(delayMs: number): void {
    if (!this.warmupEnabled || this.warmupAttempts >= this.warmupMaxAttempts || typeof window === 'undefined') {
      return;
    }
    this.clearWarmupRefresh();
    this.warmupTimeoutId = window.setTimeout(() => {
      this.warmupAttempts += 1;
      this.refreshAll(true);
    }, delayMs);
  }

  private clearWarmupRefresh(): void {
    if (this.warmupTimeoutId !== null) {
      clearTimeout(this.warmupTimeoutId);
      this.warmupTimeoutId = null;
    }
  }

  private applyData(data: AdminResolvedData): void {
    this.roles = data.roles;
    this.users = data.users;
    this.bookings = data.bookings;
    this.services = data.services;
    this.locations = data.locations;
    this.vipRequests = data.vipRequests;
    this.lastRefreshAt = Date.now();

    this.roleView.syncFromRoles(this.roles);
    this.roleViewMap = this.roleView.getRoleViewMap();

    this.employees = this.users.filter(user => (user.role || '').toUpperCase() === 'EMPLOYEE');
    this.customers = this.users.filter(user => {
      const role = (user.role || '').toUpperCase();
      return role !== 'ADMIN' && role !== 'EMPLOYEE';
    });
    this.updateAvailableBookingLocations();
  }
}
