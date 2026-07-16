import { Inbox } from "lucide-react";

type EmptyStateProps = {
  icon?: typeof Inbox;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
      <Icon
        size={40}
        strokeWidth={1.5}
        className="text-ink-soft/40 mb-4"
      />
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
