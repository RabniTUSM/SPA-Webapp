import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  success(message: string, durationMs = 3200): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 4200): void {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = 3200): void {
    this.show(message, 'info', durationMs);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(toast => toast.id !== id));
  }

  private show(message: string, type: ToastType, durationMs: number): void {
    const toast: ToastMessage = {
      id: this.nextId++,
      type,
      message
    };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }
}
