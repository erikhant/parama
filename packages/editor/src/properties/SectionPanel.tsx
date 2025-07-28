import { cn } from '@parama-ui/react';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
}

export function SectionPanel({ title, description, className, children }: SectionProps) {
  return (
    <div className={cn('p-4 space-y-3.5 border-t border-gray-200', className)}>
      <h6 className="font-semibold uppercase text-xs text-gray-400">{title}</h6>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {children}
    </div>
  );
}
SectionPanel.displayName = 'SectionPanel';
