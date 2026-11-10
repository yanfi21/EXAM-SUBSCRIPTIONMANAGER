import { Injectable, signal } from '@angular/core';
import { createId } from '../utils/id.util';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface Toast {
  id: string;
  message: string;
  action: ToastAction | null;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly state = signal<Toast[]>([]);

  readonly toasts = this.state.asReadonly();

  show(message: string, action: ToastAction | null = null): void {
    const toast: Toast = { id: createId('toast'), message, action };
    this.state.update((items) => [...items.slice(-2), toast]);
    globalThis.setTimeout(() => this.dismiss(toast.id), 5000);
  }

  dismiss(id: string): void {
    this.state.update((items) => items.filter((item) => item.id !== id));
  }

  run(toast: Toast): void {
    toast.action?.run();
    this.dismiss(toast.id);
  }
}
