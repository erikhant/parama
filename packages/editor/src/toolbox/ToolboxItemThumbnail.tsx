import { cn } from '@parama-ui/react';
import { FieldTypeDef, PresetTypeDef } from '@parama-dev/form-builder-types';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface ToolboxItemThumbnailProps {
  item: FieldTypeDef | PresetTypeDef;
  size?: number;
  className?: string;
}

export const ToolboxItemThumbnail: React.FC<ToolboxItemThumbnailProps> = ({ item, size = 24, className = '' }) => {
  if (item.image) {
    return (
      <div className={cn('bg-surface-sunken rounded-md p-2', className)}>
        <img src={item.image} alt="thumbnail" width={size} height={size} />;
      </div>
    );
  }

  if (item.icon) {
    return (
      <div className={cn('bg-surface-sunken rounded-md p-3', className)}>
        {React.createElement(item.icon as LucideIcon, {
          className: 'text-content-muted',
          size
        })}
      </div>
    );
  }

  return null;
};
