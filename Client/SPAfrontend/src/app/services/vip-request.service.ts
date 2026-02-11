import { Injectable } from '@angular/core';
import { RoleViewService } from './role-view.service';

export interface VipRequest {
  id: string;
  username: string;
  name: string;
  message: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({ providedIn: 'root' })
export class VipRequestService {
  private storageKey = 'spa_vip_requests';

  constructor(private roleView: RoleViewService) {}

  submitRequest(username: string, name: string, message: string): VipRequest {
    if (!this.hasStorage()) {
      return {
        id: `${username}-${Date.now()}`,
        username,
        name,
        message,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };
    }
    const request: VipRequest = {
      id: `${username}-${Date.now()}`,
      username,
      name,
      message,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };
    const requests = this.getRequests();
    requests.unshift(request);
    this.saveRequests(requests);
    return request;
  }

  getRequests(): VipRequest[] {
    if (!this.hasStorage()) {
      return [];
    }
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as VipRequest[];
    } catch {
      return [];
    }
  }

  getPendingRequests(): VipRequest[] {
    return this.getRequests().filter(request => request.status === 'pending');
  }

  approveRequest(id: string): VipRequest | null {
    if (!this.hasStorage()) {
      return null;
    }
    const requests = this.getRequests();
    const request = requests.find(item => item.id === id);
    if (!request) {
      return null;
    }
    request.status = 'approved';
    this.roleView.approveVip(request.username);
    this.saveRequests(requests);
    return request;
  }

  rejectRequest(id: string): VipRequest | null {
    if (!this.hasStorage()) {
      return null;
    }
    const requests = this.getRequests();
    const request = requests.find(item => item.id === id);
    if (!request) {
      return null;
    }
    request.status = 'rejected';
    this.saveRequests(requests);
    return request;
  }

  private saveRequests(requests: VipRequest[]): void {
    if (!this.hasStorage()) {
      return;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(requests));
  }

  private hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
