import { Injectable } from '@angular/core';

export type RoleView = 'customer' | 'vip' | 'employee' | 'admin';

const DEFAULT_ROLE_VIEW_MAP: Record<string, RoleView> = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  VIP: 'vip',
  CUSTOMER: 'customer',
  USER: 'customer'
};

@Injectable({ providedIn: 'root' })
export class RoleViewService {
  private storageKey = 'spa_role_views';
  private vipApprovedKey = 'spa_vip_approved';

  getRoleViewMap(): Record<string, RoleView> {
    if (!this.hasStorage()) {
      return { ...DEFAULT_ROLE_VIEW_MAP };
    }
    const stored = this.safeParse<Record<string, RoleView>>(this.storageKey, {});
    return { ...DEFAULT_ROLE_VIEW_MAP, ...stored };
  }

  setRoleView(role: string, view: RoleView): void {
    if (!this.hasStorage()) {
      return;
    }
    const map = this.getRoleViewMap();
    map[role] = view;
    localStorage.setItem(this.storageKey, JSON.stringify(map));
  }

  getRoleView(role: string | null, username?: string | null): RoleView {
    const map = this.getRoleViewMap();
    const roleName = (role || '').trim();
    const mapped = this.findMappedView(map, roleName);
    const baseView = mapped || 'customer';

    if (baseView === 'admin' || baseView === 'employee') {
      return baseView;
    }

    if (this.isVipApproved(username)) {
      return 'vip';
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

  approveVip(username: string): void {
    if (!this.hasStorage()) {
      return;
    }
    const approved = new Set(this.getVipApprovedUsers());
    approved.add(username);
    localStorage.setItem(this.vipApprovedKey, JSON.stringify(Array.from(approved)));
  }

  revokeVip(username: string): void {
    if (!this.hasStorage()) {
      return;
    }
    const approved = new Set(this.getVipApprovedUsers());
    approved.delete(username);
    localStorage.setItem(this.vipApprovedKey, JSON.stringify(Array.from(approved)));
  }

  isVipApproved(username?: string | null): boolean {
    if (!username) {
      return false;
    }
    return this.getVipApprovedUsers().includes(username);
  }

  getVipApprovedUsers(): string[] {
    return this.safeParse<string[]>(this.vipApprovedKey, []);
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

  private safeParse<T>(key: string, fallback: T): T {
    if (!this.hasStorage()) {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
