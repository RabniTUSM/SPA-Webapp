import { Component, OnInit } from '@angular/core';
import { SpaServiceService } from '../services/spa-service.service';
import { BookingService } from '../services/booking.service';
import { UserService } from '../services/user.service';
import { SpaServiceOutputDTO } from '../models/spa-service.model';
import { BookingOutputDTO } from '../models/booking.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {DatePipe, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-vip',
  templateUrl: './vip.component.html',
  imports: [
    DecimalPipe,
    DatePipe
  ],
  styleUrls: ['./vip.component.css']
})
export class VipComponent implements OnInit {
  services: SpaServiceOutputDTO[] = [];
  myBookings: BookingOutputDTO[] = [];
  bookingForm: FormGroup;
  showBookingForm = false;
  discountPercentage = 20; // 20% discount for VIP

  constructor(
    private serviceService: SpaServiceService,
    private bookingService: BookingService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      serviceId: ['', Validators.required],
      startTime: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadServices();
    this.loadMyBookings();
  }

  loadServices() {
    this.serviceService.getAllServices().subscribe(data => {
      this.services = data;
    });
  }

  loadMyBookings() {
    this.bookingService.getAllBookings().subscribe(data => {
      this.myBookings = data;
    });
  }

  getVipPrice(originalPrice: number): number {
    return originalPrice * (1 - this.discountPercentage / 100);
  }

  getSavings(originalPrice: number): number {
    return originalPrice - this.getVipPrice(originalPrice);
  }

  toggleBookingForm() {
    this.showBookingForm = !this.showBookingForm;
    this.bookingForm.reset();
  }

  bookService() {
    if (this.bookingForm.invalid) return;
    // Implementation for booking
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

