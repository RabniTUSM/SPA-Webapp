import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'aurelia-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<AppTheme>('light');
  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(STORAGE_KEY) as AppTheme | null;
      if (stored === 'light' || stored === 'dark') {
        this.themeSubject.next(stored);
      }
      this.applyTheme(this.themeSubject.value);
    }
  }

  get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
