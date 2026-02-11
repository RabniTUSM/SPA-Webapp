import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <h2 class="logo">🏨 SPA Management</h2>
      </div>
      <div class="nav-center" *ngIf="isAuthenticated">
        <button *ngIf="role === 'ADMIN'" (click)="navigate('/admin')" class="nav-btn">Admin Panel</button>
        <button *ngIf="role === 'EMPLOYEE' || role === 'ADMIN'" (click)="navigate('/employee')" class="nav-btn">My Bookings</button>
        <button *ngIf="role === 'VIP'" (click)="navigate('/vip')" class="nav-btn">VIP Services</button>
        <button (click)="navigate('/bookings')" class="nav-btn">Bookings</button>
        <button (click)="navigate('/services')" class="nav-btn">Services</button>
      </div>
      <div class="nav-right">
        <span *ngIf="isAuthenticated" class="role-badge" [class]="'role-' + role">{{ role }}</span>
        <button *ngIf="isAuthenticated" (click)="logout()" class="btn-logout">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    .nav-left { flex: 1; }
    .logo { margin: 0; font-size: 24px; }
    .nav-center {
      flex: 2;
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .nav-right {
      flex: 1;
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      align-items: center;
    }
    .nav-btn {
      padding: 8px 15px;
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid white;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }
    .nav-btn:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
    .role-badge {
      padding: 5px 15px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
    }
    .btn-logout {
      padding: 8px 15px;
      background-color: #ff6b6b;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }
    .btn-logout:hover {
      background-color: #ff5252;
    }
  `]
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  role: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.isAuthenticated = this.auth.isAuthenticated();
    this.role = this.auth.getRole();
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

