import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@parama-ui/react';
import { HelpCircleIcon } from 'lucide-react';

interface HelperTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export function HelperTooltip({ children, className }: HelperTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="tw-text-gray-600">
            <HelpCircleIcon size={15} />
          </span>
        </TooltipTrigger>
        <TooltipContent className={cn('tw-max-w-72 tw-mr-2', className)} side="top">
          <p className="form-description tw-text-gray-700 tw-leading-relaxed">
            {children || 'This field has no content.'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
