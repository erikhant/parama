import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@parama-ui/react';
import { HelpCircleIcon } from 'lucide-react';

interface HelperTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export function HelperTooltip({ children, className }: HelperTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-gray-600">
            <HelpCircleIcon size={15} />
          </span>
        </TooltipTrigger>
        <TooltipContent className={cn('max-w-72 mr-2', className)} side="top">
          <p className="form-description text-gray-700 leading-relaxed">
            {children || 'This field has no content.'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
