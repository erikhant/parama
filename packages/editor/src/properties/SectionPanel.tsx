import { cn } from '@parama-ui/react';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
}

export function SectionPanel({ title, description, className, children }: SectionProps) {
  return (
    <div className={cn('p-4 space-y-3.5 border-t border-stroke', className)}>
      <h6 className="font-semibold uppercase text-xs text-content-faint">{title}</h6>
      {description && <p className="text-xs text-content-subtle">{description}</p>}
      {children}
    </div>
  );
}
SectionPanel.displayName = 'SectionPanel';
