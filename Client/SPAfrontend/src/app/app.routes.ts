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
import { AdminDataResolver } from './admin/admin-data.resolver';
import { EmployeeDataResolver } from './employee/employee-data.resolver';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: RoleRedirectComponent, canActivate: [AuthGuard] },
  { path: 'customer', component: CustomerComponent, canActivate: [AuthGuard, CustomerGuard] },
  { path: 'vip', component: VipComponent, canActivate: [AuthGuard, VipGuard] },
  { path: 'employee', component: EmployeeComponent, canActivate: [AuthGuard, EmployeeGuard], resolve: { employeeData: EmployeeDataResolver } },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard, AdminGuard], resolve: { adminData: AdminDataResolver } },
  { path: 'users', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'bookings', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'locations', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'services', redirectTo: '/admin', pathMatch: 'full' },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
