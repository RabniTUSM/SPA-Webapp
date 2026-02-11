import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LocationComponent } from './location.component';

const routes: Routes = [
  { path: '', component: LocationComponent }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), LocationComponent],
  exports: [LocationComponent]
})
export class LocationModule {}
