import { Component, OnDestroy, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { BookingOutputDTO } from '../models/booking.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { TranslatePipe } from '../pipes/t.pipe';
import { LanguageService } from '../services/language.service';
import { Subject, catchError, distinctUntilChanged, forkJoin, map, of, takeUntil } from 'rxjs';
import { UserOutputDTO } from '../models/user.model';
import { EmployeeResolvedData } from './employee-data.resolver';

@Component({
  selector: 'app-employee',
  standalone: true,
  templateUrl: './employee.component.html',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    TranslatePipe
  ],
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit, OnDestroy {
  upcomingBookings: BookingOutputDTO[] = [];
  allBookings: BookingOutputDTO[] = [];
  filterType = 'upcoming';
  groupedBookings: { dayLabel: string; bookings: BookingOutputDTO[] }[] = [];
  employeeName = '';
  private profileLoaded = false;
  private isLoading = false;
  private readonly autoRefreshMs = 12000;
  private autoRefreshId: number | null = null;
  private lastRefreshAt = 0;
  private warmupEnabled = true;
  private warmupAttempts = 0;
  private readonly warmupMaxAttempts = 10;
  private warmupTimeoutId: number | null = null;
  private pendingForcedRefresh = false;
  private readonly destroy$ = new Subject<void>();
  private readonly onWindowFocus = () => this.refreshAll();
  private readonly onVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.refreshAll();
    }
  };

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private userService: UserService,
    private language: LanguageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const resolved: EmployeeResolvedData | undefined = this.route.snapshot.data['employeeData'];
    if (resolved) {
      this.applyData(resolved.users, resolved.bookings);
      const hasCoreData = this.profileLoaded;
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

    let firstSessionEmission = true;
    this.auth.sessionState$
      .pipe(
        map(state => `${state.token ?? ''}|${state.username ?? ''}`),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (firstSessionEmission) {
          firstSessionEmission = false;
          return;
        }
        this.warmupEnabled = true;
        this.warmupAttempts = 0;
        this.clearWarmupRefresh();
        this.refreshAll(true);
      });

    if (typeof window !== 'undefined') {
      this.autoRefreshId = window.setInterval(() => this.refreshAll(), this.autoRefreshMs);
      window.addEventListener('focus', this.onWindowFocus);
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
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
    this.destroy$.next();
    this.destroy$.complete();
  }

  private refreshAll(force = false): void {
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

    const username = this.auth.getUsername();
    if (!username) {
      this.profileLoaded = false;
      this.employeeName = '';
      this.allBookings = [];
      this.filterBookings();
      this.lastRefreshAt = Date.now();
      return;
    }

    this.isLoading = true;
    forkJoin({
      users: this.userService.getAllUsers().pipe(
        catchError(() => of([] as UserOutputDTO[]))
      ),
      bookings: this.bookingService.getAllBookings().pipe(
        catchError(() => of([] as BookingOutputDTO[]))
      )
    }).subscribe({
      next: result => {
        this.applyData(result.users, result.bookings);
      },
      error: () => {
        this.profileLoaded = false;
        this.employeeName = username;
        this.allBookings = [];
        this.filterBookings();
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

  filterBookings() {
    const employeeNameKey = this.normalize(this.employeeName);
    const usernameKey = this.normalize(this.auth.getUsername());
    const now = new Date();
    const scoped = this.allBookings.filter(booking => {
      const bookingEmployeeName = this.normalize(booking.employeeName);
      if (!bookingEmployeeName) {
        return false;
      }
      return bookingEmployeeName === employeeNameKey || bookingEmployeeName === usernameKey;
    });

    const filtered = this.filterType === 'upcoming'
      ? scoped.filter(b => new Date(b.startTime) > now)
      : scoped;
    this.upcomingBookings = filtered.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    this.groupedBookings = this.groupByDay(this.upcomingBookings);
  }

  onFilterChange() {
    this.filterBookings();
  }

  getTimeRemaining(startTime: string): string {
    const start = new Date(startTime);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    return `${hours}h ${minutes}m`;
  }

  private groupByDay(bookings: BookingOutputDTO[]) {
    const groups = new Map<string, BookingOutputDTO[]>();
    bookings.forEach(booking => {
      const date = new Date(booking.startTime);
      const key = this.toLocalDateKey(date);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(booking);
    });
    return Array.from(groups.entries()).map(([key, values]) => ({
      dayLabel: new Date(`${key}T00:00:00`).toLocaleDateString(
        this.language.currentLanguage === 'bg' ? 'bg-BG' : 'en-US',
        {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      }),
      bookings: values
    }));
  }

  private toLocalDateKey(date: Date): string {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  private applyData(users: UserOutputDTO[], bookings: BookingOutputDTO[]): void {
    const username = this.normalize(this.auth.getUsername());
    const employee = users.find(user => this.normalize(user.username) === username) ?? null;
    this.profileLoaded = Boolean(employee);
    this.employeeName = employee?.name || this.auth.getUsername() || '';
    this.allBookings = bookings;
    this.filterBookings();
    this.lastRefreshAt = Date.now();
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

  private handleWarmupAfterRefresh(): void {
    if (!this.warmupEnabled) {
      return;
    }
    if (this.profileLoaded) {
      this.warmupEnabled = false;
      this.clearWarmupRefresh();
      return;
    }
    this.scheduleWarmupRefresh(800);
  }

  private normalize(value: string | null | undefined): string {
    return (value || '').trim().toLowerCase();
  }
}
