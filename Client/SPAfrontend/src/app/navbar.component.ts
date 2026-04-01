import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { RoleViewService } from './services/role-view.service';
import { LanguageService, AppLanguage } from './services/language.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <button class="brand" type="button" (click)="navigate('/home')" aria-label="Go to home">
        <img class="brand-logo" src="/assets/aurelia-logo.svg" alt="Aurelia logo" />
      </button>

      <div class="nav-center" *ngIf="isAuthenticated">
        <button *ngIf="view === 'customer'" (click)="navigate('/customer')" class="nav-btn">{{ t('nav.reservations') }}</button>
        <button *ngIf="view === 'vip'" (click)="navigate('/vip')" class="nav-btn">{{ t('nav.vip') }}</button>
        <button *ngIf="view === 'employee' || view === 'admin'" (click)="navigate('/employee')" class="nav-btn">{{ t('nav.schedule') }}</button>
        <button *ngIf="view === 'admin'" (click)="navigate('/admin')" class="nav-btn">{{ t('nav.control') }}</button>
      </div>

      <div class="nav-right">
        <div class="utility-controls">
          <div class="lang-switch" role="group" aria-label="Language switch">
            <button type="button" [class.active]="language.currentLanguage === 'bg'" (click)="setLanguage('bg')">BG</button>
            <button type="button" [class.active]="language.currentLanguage === 'en'" (click)="setLanguage('en')">EN</button>
          </div>
          <button type="button" class="theme-btn" (click)="toggleTheme()">
            {{ theme.currentTheme === 'dark' ? t('nav.lightMode') : t('nav.darkMode') }}
          </button>
        </div>

        <span *ngIf="isAuthenticated" class="role-badge" [ngClass]="view ? 'role-' + view : ''">{{ getRoleLabel() }}</span>
        <button *ngIf="isAuthenticated" (click)="logout()" class="btn-logout">{{ t('nav.signOut') }}</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      width: min(1280px, calc(100% - 32px));
      margin: 14px auto 0;
      padding: 14px 18px;
      border-radius: 20px;
      border: 1px solid var(--surface-line);
      background: linear-gradient(160deg, rgba(255, 252, 246, 0.88), rgba(244, 233, 216, 0.8));
      box-shadow: 0 18px 40px rgba(56, 34, 15, 0.12);
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 14px;
      position: sticky;
      top: 10px;
      z-index: 30;
    }

    .brand {
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .brand-logo {
      width: 170px;
      height: auto;
      display: block;
    }

    .nav-center {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .nav-btn {
      border: 1px solid rgba(40, 105, 98, 0.25);
      background: rgba(255, 255, 255, 0.58);
      color: #1f504b;
      font-weight: 700;
      font-size: 12px;
      padding: 9px 13px;
      border-radius: 999px;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }

    .nav-btn:hover {
      border-color: rgba(40, 105, 98, 0.5);
      box-shadow: 0 8px 16px rgba(25, 77, 69, 0.16);
    }

    .nav-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      flex-wrap: wrap;
    }

    .utility-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .lang-switch {
      display: flex;
      align-items: center;
      border: 1px solid rgba(18, 70, 66, 0.22);
      border-radius: 999px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.55);
    }

    .lang-switch button {
      border: none;
      background: transparent;
      color: #245d56;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 7px 10px;
      cursor: pointer;
    }

    .lang-switch button.active {
      background: rgba(31, 102, 97, 0.18);
    }

    .theme-btn {
      border: 1px solid rgba(18, 70, 66, 0.22);
      background: rgba(255, 255, 255, 0.55);
      color: #245d56;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 7px 10px;
      border-radius: 999px;
      cursor: pointer;
    }

    .role-badge {
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(17, 71, 66, 0.09);
      color: #1d5953;
      border: 1px solid rgba(18, 70, 66, 0.2);
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .btn-logout {
      border: none;
      background: linear-gradient(125deg, #1f6661, #2b7f77);
      color: #f7f5f0;
      font-weight: 700;
      font-size: 12px;
      padding: 9px 16px;
      border-radius: 999px;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(20, 69, 64, 0.24);
    }

    .btn-logout:hover {
      filter: brightness(1.05);
    }

    @media (max-width: 1080px) {
      .navbar {
        width: calc(100% - 20px);
        grid-template-columns: 1fr auto;
        gap: 10px;
      }

      .brand-logo {
        width: 150px;
      }

      .nav-center {
        grid-column: 1 / -1;
        justify-content: flex-start;
      }
    }

    @media (max-width: 560px) {
      .navbar {
        margin-top: 8px;
        padding: 12px;
      }

      .brand-logo {
        width: 132px;
      }

      .nav-btn {
        font-size: 11px;
        padding: 8px 11px;
      }

      .btn-logout {
        padding: 8px 12px;
        font-size: 11px;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  view: 'customer' | 'vip' | 'employee' | 'admin' | null = null;

  constructor(
    private auth: AuthService,
    private roleView: RoleViewService,
    private router: Router,
    public language: LanguageService,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    this.refreshState();
    this.auth.sessionState$.subscribe(() => {
      this.refreshState();
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.refreshState();
    });
  }

  t(key: string): string {
    return this.language.t(key);
  }

  setLanguage(language: AppLanguage): void {
    this.language.setLanguage(language);
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getRoleLabel(): string {
    if (!this.view) {
      return '';
    }
    return this.t(`role.${this.view}`);
  }

  private refreshState() {
    this.isAuthenticated = this.auth.isAuthenticated();
    this.view = this.isAuthenticated
      ? this.roleView.getRoleView(this.auth.getRole(), this.auth.getUsername())
      : null;
  }
}
