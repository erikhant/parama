import { cn } from '@parama-ui/react';

type ToolboxItemProps = {
  id: string;
  name: string;
  description?: string;
  thumbnail?: React.ReactNode;
  className?: string;
};
export const ToolboxItem: React.FC<ToolboxItemProps> = ({ id, name, description, thumbnail, className = '' }) => {
  return (
    <div
      data-id={id}
      className={cn(
        `tw-text-center tw-h-28 tw-flex tw-items-center tw-gap-1 tw-border tw-border-gray-300/80 tw-rounded hover:tw-shadow-sm hover:tw-shadow-gray-300/80 tw-w-full ${className}`
      )}>
      {thumbnail}
      <div className="tw-space-y-1 tw-text-start">
        <span className="tw-text-gray-700 tw-text-[13px] tw-block tw-font-semibold">{name}</span>
        {description && <small className="tw-text-xs tw-text-gray-400 tw-line-clamp-2">{description}</small>}
      </div>
    </div>
  );
};
