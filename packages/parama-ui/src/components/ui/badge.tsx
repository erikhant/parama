import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva('badge', {
  variants: {
    size: {
      xs: 'badge-xs',
      sm: 'badge-sm',
      lg: 'badge-lg'
    }
  },
  defaultVariants: {
    size: 'sm'
  }
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  variant?: 'fill' | 'outline' | 'shadow';
}

function Badge({
  className,
  size,
  variant = 'fill',
  color = 'primary',
  ...props
}: BadgeProps) {
  const composedClassName = cn(
    badgeVariants({ size }),
    variant === 'fill'
      ? `badge-${color}`
      : `badge-${color} badge-${color}-${variant}`,
    className
  );

  return <div className={composedClassName} {...props} />;
}

export { Badge, badgeVariants };
