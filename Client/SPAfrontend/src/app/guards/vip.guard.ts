import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleViewService } from '../services/role-view.service';

@Injectable({ providedIn: 'root' })
export class VipGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private roleView: RoleViewService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const view = this.roleView.getRoleView(this.auth.getRole(), this.auth.getUsername());
    if (view === 'vip' || view === 'admin') {
      return true;
    }
    this.router.navigate(['/home']);
    return false;
  }
}
