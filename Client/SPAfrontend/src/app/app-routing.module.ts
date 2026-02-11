import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { EmployeeGuard } from './guards/employee.guard';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { EmployeeComponent } from './employee/employee.component';
import { VipComponent } from './vip/vip.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'employee', component: EmployeeComponent, canActivate: [EmployeeGuard] },
  { path: 'vip', component: VipComponent, canActivate: [AuthGuard] },
  { path: 'users', loadChildren: () => import('./user/user.module').then(m => m.UserModule), canActivate: [AuthGuard] },
  { path: 'bookings', loadChildren: () => import('./booking/booking.module').then(m => m.BookingModule), canActivate: [AuthGuard] },
  { path: 'locations', loadChildren: () => import('./location/location.module').then(m => m.LocationModule), canActivate: [AuthGuard] },
  { path: 'services', loadChildren: () => import('./spa-service/spa-service.module').then(m => m.SpaServiceModule), canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}


