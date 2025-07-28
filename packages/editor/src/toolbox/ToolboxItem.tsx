import { cn } from '@parama-ui/react';

type ToolboxItemProps = {
  id: string;
  name: string;
  description?: string;
  thumbnail?: React.ReactNode;
  className?: string;
};
export const ToolboxItem: React.FC<ToolboxItemProps> = ({
  id,
  name,
  description,
  thumbnail,
  className = ''
}) => {
  return (
    <div
      data-id={id}
      className={cn(
        `text-center h-28 flex flex-col items-center justify-center gap-1 border border-gray-300/80 rounded hover:shadow-sm hover:shadow-gray-300/80 w-full ${className}`
      )}>
      {thumbnail}
      <div className="space-y-1 text-start">
        <span className="text-gray-700 text-[13px] block font-semibold">{name}</span>
        {description && <small className="text-xs text-gray-400 line-clamp-2">{description}</small>}
      </div>
    </div>
  );
};
