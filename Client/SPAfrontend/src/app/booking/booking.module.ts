import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { BookingComponent } from './booking.component';

const routes: Routes = [
  { path: '', component: BookingComponent }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), BookingComponent],
  exports: [BookingComponent]
})
export class BookingModule {}
