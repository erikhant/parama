import { cn } from '@/lib/utils';
import React from 'react';

export type FormItemProps = React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical';
};

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ orientation = 'vertical', ...props }, ref) => {
    return (
      <div
        className={cn(
          `form-item ${orientation === 'horizontal' ? 'form-item-horizontal' : ''} ${props.className}`
        )}
        {...props}
        ref={ref}>
        {props.children}
      </div>
    );
  }
);

FormItem.displayName = 'FormItem';
