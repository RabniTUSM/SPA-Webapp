import { Component, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { BookingOutputDTO } from '../models/booking.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  templateUrl: './employee.component.html',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe
  ],
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  upcomingBookings: BookingOutputDTO[] = [];
  allBookings: BookingOutputDTO[] = [];
  filterType = 'upcoming';
  groupedBookings: { dayLabel: string; bookings: BookingOutputDTO[] }[] = [];
  employeeName = '';

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadEmployeeProfile();
    this.loadBookings();
  }

  loadEmployeeProfile() {
    const username = this.auth.getUsername();
    if (!username) return;
    this.userService.getUserByUsername(username).subscribe({
      next: user => {
        this.employeeName = user.name;
        this.filterBookings();
      },
      error: () => {
        this.employeeName = '';
      }
    });
  }

  loadBookings() {
    this.bookingService.getAllBookings().subscribe(data => {
      this.allBookings = data;
      this.filterBookings();
    });
  }

  filterBookings() {
    const now = new Date();
    const scoped = this.employeeName
      ? this.allBookings.filter(b => b.employeeName === this.employeeName)
      : this.allBookings;
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
      dayLabel: new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
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
