import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleViewService } from '../services/role-view.service';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-redirect.component.html',
  styleUrls: ['./role-redirect.component.scss']
})
export class RoleRedirectComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private roleView: RoleViewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const view = this.roleView.getRoleView(this.auth.getRole(), this.auth.getUsername());
    this.router.navigate([this.roleView.getRouteForView(view)]);
  }
}
