import React from 'react';
import { useEditor } from '../store/useEditor';
import { ToolboxItem } from './ToolboxItem';
import { LucideIcon } from 'lucide-react';
import { ToolboxItemThumbnail } from './ToolboxItemThumbnail';

type ToolboxItemOverlayProps = {
  id: string;
};

export const ToolboxItemOverlay: React.FC<ToolboxItemOverlayProps> = ({ id }) => {
  const { toolbox } = useEditor();

  // Check both fields and presets
  const field = toolbox.fields.find((f) => f.id === id) || toolbox.presets.find((p) => p.id === id);

  return (
    field && (
      <ToolboxItem
        id={id}
        name={field.label}
        className="flex-row items-center justify-start gap-3 font-medium h-auto p-2 bg-surface rounded-lg border-stroke-subtle shadow-none hover:border-stroke hover:shadow-none"
        thumbnail={<ToolboxItemThumbnail item={field} size={24} className="shrink-0" />}
      />
    )
  );
};
