import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      icon="alert"
      title="Страница не найдена"
      description="Проверьте адрес или вернитесь к списку задач."
      action={
        <Link className="btn btn-primary" to="/tasks/list">
          К списку задач
        </Link>
      }
    />
  );
}
