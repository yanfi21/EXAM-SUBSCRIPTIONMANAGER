import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          role="status"
          class="card pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3 shadow-lg"
        >
          <span class="text-sm text-ink">{{ toast.message }}</span>
          <div class="flex items-center gap-1">
            @if (toast.action) {
              <button type="button" class="btn btn-soft btn-sm" (click)="toasts.run(toast)">
                {{ toast.action.label }}
              </button>
            }
            <button type="button" class="btn btn-ghost btn-sm" (click)="toasts.dismiss(toast.id)">
              ✕
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
