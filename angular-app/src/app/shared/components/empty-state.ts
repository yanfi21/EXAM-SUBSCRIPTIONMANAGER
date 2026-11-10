import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, type IconName } from './icon';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <app-icon [name]="icon()" [size]="22" />
      </span>
      <h3 class="text-base font-bold text-ink">{{ title() }}</h3>
      @if (description()) {
        <p class="muted max-w-md">{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyState {
  readonly icon = input<IconName>('sparkles');
  readonly title = input.required<string>();
  readonly description = input('');
}
