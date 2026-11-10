import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      (click)="onBackdrop($event)"
    >
      <div
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        class="card scroll-thin max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:rounded-2xl"
        [class.max-w-md]="width() === 'sm'"
        [class.max-w-xl]="width() === 'md'"
        [class.max-w-3xl]="width() === 'lg'"
        (click)="$event.stopPropagation()"
      >
        <header class="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 class="text-base font-bold text-ink">{{ title() }}</h2>
            @if (description()) {
              <p class="muted mt-0.5">{{ description() }}</p>
            }
          </div>
          <button type="button" class="btn btn-ghost btn-sm" (click)="closed.emit()" aria-label="Закрыть">
            <app-icon name="close" [size]="16" />
          </button>
        </header>
        <div class="px-5 py-4">
          <ng-content />
        </div>
        <footer class="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3">
          <ng-content select="[modalFooter]" />
        </footer>
      </div>
    </div>
  `,
})
export class Modal {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly width = input<'sm' | 'md' | 'lg'>('md');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
