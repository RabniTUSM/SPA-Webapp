import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SpaServiceComponent } from './spa-service.component';

const routes: Routes = [
  { path: '', component: SpaServiceComponent }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), SpaServiceComponent],
})
export class SpaServiceModule {}
