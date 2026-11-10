import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'sparkles', title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {description ? <p className="muted max-w-md">{description}</p> : null}
      {action}
    </div>
  );
}
