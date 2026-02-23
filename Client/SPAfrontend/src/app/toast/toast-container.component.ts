import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastMessage, ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      <article
        class="toast"
        *ngFor="let toast of toastService.toasts$ | async; trackBy: trackById"
        [class.success]="toast.type === 'success'"
        [class.error]="toast.type === 'error'"
        [class.info]="toast.type === 'info'"
      >
        <span>{{ toast.message }}</span>
        <button type="button" class="close-btn" (click)="toastService.dismiss(toast.id)" aria-label="Close notification">×</button>
      </article>
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 1100;
      display: grid;
      gap: 10px;
      width: min(360px, calc(100vw - 28px));
    }

    .toast {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid transparent;
      box-shadow: 0 16px 34px rgba(20, 11, 5, 0.18);
      background: rgba(28, 39, 46, 0.95);
      color: #f2f6f8;
      font-weight: 600;
      line-height: 1.35;
      animation: toastIn 0.24s ease;
    }

    .toast span {
      color: inherit;
    }

    .toast.success {
      background: linear-gradient(135deg, #236f65, #1e5d56);
      border-color: rgba(132, 232, 211, 0.25);
    }

    .toast.error {
      background: linear-gradient(135deg, #983f32, #7a3026);
      border-color: rgba(255, 197, 186, 0.24);
    }

    .toast.info {
      background: linear-gradient(135deg, #2d5d74, #244a5d);
      border-color: rgba(176, 225, 250, 0.22);
    }

    .close-btn {
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0;
      opacity: 0.72;
    }

    .close-btn:hover {
      opacity: 1;
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ToastContainerComponent {
  constructor(public readonly toastService: ToastService) {}

  trackById(_index: number, toast: ToastMessage): number {
    return toast.id;
  }
}
