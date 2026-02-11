import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { RoleViewService } from './services/role-view.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <h2 class="logo">SPA Management</h2>
      </div>
      <div class="nav-center" *ngIf="isAuthenticated">
        <button *ngIf="view === 'customer'" (click)="navigate('/customer')" class="nav-btn">My Reservations</button>
        <button *ngIf="view === 'vip'" (click)="navigate('/vip')" class="nav-btn">VIP Lounge</button>
        <button *ngIf="view === 'employee' || view === 'admin'" (click)="navigate('/employee')" class="nav-btn">Schedule</button>
        <button *ngIf="view === 'admin'" (click)="navigate('/admin')" class="nav-btn">Admin Panel</button>
        <button *ngIf="view === 'admin'" (click)="navigate('/bookings')" class="nav-btn">Bookings</button>
        <button *ngIf="view === 'admin'" (click)="navigate('/services')" class="nav-btn">Services</button>
        <button *ngIf="view === 'admin'" (click)="navigate('/locations')" class="nav-btn">Locations</button>
        <button *ngIf="view === 'admin'" (click)="navigate('/users')" class="nav-btn">Users</button>
      </div>
      <div class="nav-right">
        <span *ngIf="isAuthenticated" class="role-badge" [class]="'role-' + view">{{ viewLabel }}</span>
        <button *ngIf="isAuthenticated" (click)="logout()" class="btn-logout">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 32px;
      background: linear-gradient(120deg, #efe6d9, #f7f1e6);
      color: #2c221b;
      border-bottom: 1px solid rgba(44, 34, 27, 0.15);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .nav-left { flex: 1; }
    .logo { margin: 0; font-size: 22px; font-family: 'Sora', 'Trebuchet MS', sans-serif; }
    .nav-center {
      flex: 2;
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .nav-right {
      flex: 1;
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      align-items: center;
    }
    .nav-btn {
      padding: 8px 14px;
      background-color: transparent;
      color: #2c221b;
      border: 1px solid rgba(44, 34, 27, 0.25);
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .nav-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(60, 45, 32, 0.15);
    }
    .role-badge {
      padding: 5px 15px;
      background-color: rgba(55, 44, 33, 0.08);
      border-radius: 20px;
      font-weight: bold;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .btn-logout {
      padding: 8px 16px;
      background-color: #c45d3b;
      color: #fffaf2;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      font-weight: bold;
    }
    .btn-logout:hover {
      background-color: #b05030;
    }

    @media (max-width: 900px) {
      .navbar {
        padding: 12px 16px;
      }
      .nav-center {
        gap: 8px;
      }
      .logo {
        font-size: 18px;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  view: 'customer' | 'vip' | 'employee' | 'admin' | null = null;
  viewLabel = '';

  constructor(
    private auth: AuthService,
    private roleView: RoleViewService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refreshState();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.refreshState();
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private refreshState() {
    this.isAuthenticated = this.auth.isAuthenticated();
    if (this.isAuthenticated) {
      this.view = this.roleView.getRoleView(this.auth.getRole(), this.auth.getUsername());
      this.viewLabel = this.view.toUpperCase();
    } else {
      this.view = null;
      this.viewLabel = '';
    }
  }
}
