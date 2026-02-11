import { Component, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { BookingOutputDTO, BookingInputDTO } from '../models/booking.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookings: BookingOutputDTO[] = [];
  bookingForm: FormGroup;

  constructor(private bookingService: BookingService, private fb: FormBuilder) {
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
  }

  loadBookings() {
    this.bookingService.getAllBookings().subscribe(data => this.bookings = data);
  }

  createBooking() {
    if (this.bookingForm.invalid) return;
    const payload: BookingInputDTO = this.bookingForm.value;
    this.bookingService.createBooking(payload).subscribe(() => {
      this.bookingForm.reset();
      this.loadBookings();
    });
  }

  deleteBooking(id: number) {
    if (!confirm('Delete booking?')) return;
    this.bookingService.deleteBooking(id).subscribe(() => this.loadBookings());
  }
}

