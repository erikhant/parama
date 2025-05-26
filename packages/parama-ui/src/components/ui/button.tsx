import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('btn', {
  variants: {
    size: {
      default: 'btn-default',
      xs: 'btn-xs',
      sm: 'btn-sm',
      lg: 'btn-lg'
    }
  },
  defaultVariants: {
    size: 'default'
  }
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isIcon?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  variant?: 'fill' | 'outline' | 'ghost' | 'shadow';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'fill',
      size,
      color = 'primary',
      asChild = false,
      isIcon = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    const composedClassName = cn(
      variant === 'fill'
        ? `btn-${color}`
        : `btn-${color} btn-${color}-${variant}`,
      buttonVariants({ size }),
      isIcon ? 'btn-icon' : undefined,
      className
    );

    return <Comp className={composedClassName} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
