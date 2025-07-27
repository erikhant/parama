import { cn } from '@parama-ui/react';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
}

export function SectionPanel({ title, description, className, children }: SectionProps) {
  return (
    <div className={cn('tw-p-4 tw-space-y-3.5 tw-border-t tw-border-gray-200', className)}>
      <h6 className="tw-font-semibold tw-uppercase tw-text-xs tw-text-gray-400">{title}</h6>
      {description && <p className="tw-text-xs tw-text-gray-500">{description}</p>}
      {children}
    </div>
  );
}
SectionPanel.displayName = 'SectionPanel';
