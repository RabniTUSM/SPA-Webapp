import { Component, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { BookingOutputDTO } from '../models/booking.model';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  imports: [
    FormsModule,
    DatePipe
  ],
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  upcomingBookings: BookingOutputDTO[] = [];
  allBookings: BookingOutputDTO[] = [];
  filterType = 'upcoming';

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getAllBookings().subscribe(data => {
      this.allBookings = data;
      this.filterBookings();
    });
  }

  filterBookings() {
    const now = new Date();
    if (this.filterType === 'upcoming') {
      this.upcomingBookings = this.allBookings.filter(b => new Date(b.startTime) > now);
    } else {
      this.upcomingBookings = this.allBookings;
    }
  }

  onFilterChange() {
    this.filterBookings();
  }

  getTimeRemaining(startTime: string): string {
    const start = new Date(startTime);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

