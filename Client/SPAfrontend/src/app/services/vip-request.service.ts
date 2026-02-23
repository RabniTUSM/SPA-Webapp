import { Injectable } from '@angular/core';

const VIP_REQUESTS_KEY = 'aurelia-vip-requests';

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
  private requests: VipRequest[] = [];

  constructor() {
    this.restoreRequests();
  }

  submitRequest(username: string, name: string, message: string): VipRequest {
    const request: VipRequest = {
      id: `${username}-${Date.now()}`,
      username,
      name,
      message,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };
    this.requests.unshift(request);
    this.persistRequests();
    return request;
  }

  getRequests(): VipRequest[] {
    return [...this.requests];
  }

  getPendingRequests(): VipRequest[] {
    return this.getRequests().filter(request => request.status === 'pending');
  }

  approveRequest(id: string): VipRequest | null {
    const request = this.requests.find(item => item.id === id);
    if (!request) {
      return null;
    }
    request.status = 'approved';
    this.persistRequests();
    return request;
  }

  rejectRequest(id: string): VipRequest | null {
    const request = this.requests.find(item => item.id === id);
    if (!request) {
      return null;
    }
    request.status = 'rejected';
    this.persistRequests();
    return request;
  }

  private restoreRequests(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = window.localStorage.getItem(VIP_REQUESTS_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as VipRequest[];
      this.requests = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.requests = [];
    }
  }

  private persistRequests(): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify(this.requests));
  }
}
