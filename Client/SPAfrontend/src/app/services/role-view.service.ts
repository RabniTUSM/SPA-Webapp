import { Injectable } from '@angular/core';

export type RoleView = 'customer' | 'vip' | 'employee' | 'admin';

const ROLE_OVERRIDES_KEY = 'aurelia-role-view-overrides';

const DEFAULT_ROLE_VIEW_MAP: Record<string, RoleView> = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  VIP: 'vip',
  CUSTOMER: 'customer',
  USER: 'customer'
};

@Injectable({ providedIn: 'root' })
export class RoleViewService {
  private roleViewOverrides: Record<string, RoleView> = {};

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedOverrides = window.localStorage.getItem(ROLE_OVERRIDES_KEY);
      if (storedOverrides) {
        this.roleViewOverrides = JSON.parse(storedOverrides) as Record<string, RoleView>;
      }
    } catch {
      this.roleViewOverrides = {};
    }
  }

  getRoleViewMap(): Record<string, RoleView> {
    return { ...DEFAULT_ROLE_VIEW_MAP, ...this.roleViewOverrides };
  }

  setRoleView(role: string, view: RoleView): void {
    const map = this.getRoleViewMap();
    map[role] = view;
    this.roleViewOverrides = { ...map };
    this.persistOverrides();
  }

  syncFromRoles(roles: Array<{ name: string; viewType?: string | null }>): void {
    const nextOverrides: Record<string, RoleView> = { ...DEFAULT_ROLE_VIEW_MAP };
    for (const role of roles) {
      let view = this.normalizeView(role.viewType);
      const upperRoleName = role.name.toUpperCase();
      const defaultView = DEFAULT_ROLE_VIEW_MAP[upperRoleName];
      if (view === 'customer' && defaultView && defaultView !== 'customer') {
        view = defaultView;
      }
      if (view) {
        nextOverrides[role.name] = view;
      }
    }
    this.roleViewOverrides = nextOverrides;
    this.persistOverrides();
  }

  getRoleView(role: string | null, _username?: string | null): RoleView {
    const normalizedRole = (role || '').trim().toUpperCase();
    if (normalizedRole === 'ADMIN') {
      return 'admin';
    }
    if (normalizedRole === 'EMPLOYEE') {
      return 'employee';
    }
    if (normalizedRole === 'VIP') {
      return 'vip';
    }

    const map = this.getRoleViewMap();
    const roleName = (role || '').trim();
    const mapped = this.findMappedView(map, roleName);
    const baseView = mapped || 'customer';

    if (baseView === 'admin' || baseView === 'employee' || baseView === 'vip') {
      return baseView;
    }

    return baseView;
  }

  getRouteForView(view: RoleView): string {
    switch (view) {
      case 'admin':
        return '/admin';
      case 'employee':
        return '/employee';
      case 'vip':
        return '/vip';
      default:
        return '/customer';
    }
  }

  private findMappedView(map: Record<string, RoleView>, role: string): RoleView | null {
    if (!role) {
      return null;
    }
    if (map[role]) {
      return map[role];
    }
    const lower = role.toLowerCase();
    const match = Object.keys(map).find(key => key.toLowerCase() === lower);
    return match ? map[match] : null;
  }

  private normalizeView(view: string | null | undefined): RoleView | null {
    const normalized = (view || '').trim().toLowerCase();
    if (normalized === 'customer' || normalized === 'vip' || normalized === 'employee' || normalized === 'admin') {
      return normalized;
    }
    return null;
  }

  private persistOverrides(): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(ROLE_OVERRIDES_KEY, JSON.stringify(this.roleViewOverrides));
  }
}
