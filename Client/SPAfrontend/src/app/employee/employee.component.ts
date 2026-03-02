import { Component, OnDestroy, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { BookingOutputDTO } from '../models/booking.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { TranslatePipe } from '../pipes/t.pipe';
import { LanguageService } from '../services/language.service';
import { catchError, forkJoin, of } from 'rxjs';

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
  private loadAttempt = 0;
  private readonly maxLoadAttempts = 5;
  private retryTimeoutId: number | null = null;

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private userService: UserService,
    private language: LanguageService
  ) {}

  ngOnInit() {
    this.loadSchedule();
  }

  ngOnDestroy(): void {
    this.clearRetry();
  }

  private loadSchedule(): void {
    const username = this.auth.getUsername();
    if (!username) {
      this.employeeName = '';
      this.allBookings = [];
      this.filterBookings();
      return;
    }

    forkJoin({
      user: this.userService.getUserByUsername(username).pipe(catchError(() => of(null))),
      bookings: this.bookingService.getAllBookings().pipe(catchError(() => of(null)))
    }).subscribe(({ user, bookings }) => {
      const profileLoaded = !!user;
      const bookingsLoaded = Array.isArray(bookings);

      if (user) {
        this.employeeName = user.name;
      }
      if (bookingsLoaded) {
        this.allBookings = bookings;
      }

      this.filterBookings();

      if ((!profileLoaded || !bookingsLoaded) && this.loadAttempt < this.maxLoadAttempts) {
        this.scheduleRetry();
        return;
      }

      this.loadAttempt = 0;
      this.clearRetry();
    });
  }

  filterBookings() {
    const now = new Date();
    const scoped = this.employeeName
      ? this.allBookings.filter(b => b.employeeName === this.employeeName)
      : [];
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

  private scheduleRetry(): void {
    this.loadAttempt += 1;
    this.clearRetry();
    if (typeof window === 'undefined') {
      return;
    }
    this.retryTimeoutId = window.setTimeout(() => this.loadSchedule(), 700);
  }

  private clearRetry(): void {
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
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
}
