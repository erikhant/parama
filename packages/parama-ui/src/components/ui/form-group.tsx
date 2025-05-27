import { cn } from '@/lib/utils';
import React from 'react';

type FormGroupProps = React.ComponentProps<'div'> & {
  prefix?: string;
  suffix?: string;
  addOnStart?: React.ReactNode;
  addOnEnd?: React.ReactNode;
};
export const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ prefix, suffix, addOnEnd, addOnStart, className = '', ...props }, ref) => {
    return (
      <div className={cn('form-group', className)} {...props} ref={ref}>
        {addOnStart && (
          <div className="form-group-addon-start">{addOnStart}</div>
        )}
        {prefix && <div className="form-group-prefix">{prefix}</div>}
        {props.children}
        {suffix && <div className="form-group-suffix">{suffix}</div>}
        {addOnEnd && <div className="form-group-addon-end">{addOnEnd}</div>}
      </div>
    );
  }
);
FormGroup.displayName = 'FormGroup';
