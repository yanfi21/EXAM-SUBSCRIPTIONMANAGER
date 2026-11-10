import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/components/empty-state';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyState],
  template: `
    <app-empty-state
      icon="alert"
      title="Страница не найдена"
      description="Проверьте адрес или вернитесь к списку задач."
    >
      <a class="btn btn-primary" routerLink="/tasks/list">К списку задач</a>
    </app-empty-state>
  `,
})
export class NotFoundPage {}
