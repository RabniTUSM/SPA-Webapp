import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { EmployeeComponent } from './employee/employee.component';
import { VipComponent } from './vip/vip.component';
import { CustomerComponent } from './customer/customer.component';
import { RoleRedirectComponent } from './role-redirect/role-redirect.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { EmployeeGuard } from './guards/employee.guard';
import { VipGuard } from './guards/vip.guard';
import { CustomerGuard } from './guards/customer.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: RoleRedirectComponent, canActivate: [AuthGuard] },
  { path: 'customer', component: CustomerComponent, canActivate: [AuthGuard, CustomerGuard] },
  { path: 'vip', component: VipComponent, canActivate: [AuthGuard, VipGuard] },
  { path: 'employee', component: EmployeeComponent, canActivate: [AuthGuard, EmployeeGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard, AdminGuard] },
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'bookings',
    loadChildren: () => import('./booking/booking.module').then(m => m.BookingModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'locations',
    loadChildren: () => import('./location/location.module').then(m => m.LocationModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'services',
    loadChildren: () => import('./spa-service/spa-service.module').then(m => m.SpaServiceModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
