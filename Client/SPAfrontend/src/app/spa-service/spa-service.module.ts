import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-spa-service',
  template: '<h2>Spa Service Management Works!</h2>'
})
export class SpaServiceComponent {}

const routes: Routes = [
  { path: '', component: SpaServiceComponent }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), SpaServiceComponent],
})
export class SpaServiceModule {}
