import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Modal } from './modal';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal],
  template: `
    <app-modal [title]="title()" width="sm" (closed)="cancelled.emit()">
      <p class="text-sm text-ink">{{ message() }}</p>
      <ng-container modalFooter>
        <button type="button" class="btn btn-soft" (click)="cancelled.emit()">
          {{ cancelLabel() }}
        </button>
        <button type="button" class="btn btn-danger" (click)="confirmed.emit()">
          {{ confirmLabel() }}
        </button>
      </ng-container>
    </app-modal>
  `,
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Подтвердить');
  readonly cancelLabel = input('Отмена');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
