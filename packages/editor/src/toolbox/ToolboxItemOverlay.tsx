import React from 'react';
import { useEditor } from '../store/useEditor';
import { ToolboxItem } from './ToolboxItem';
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
        className="tw-flex-row tw-items-center tw-justify-start tw-gap-3 tw-font-medium tw-h-auto tw-p-2 tw-bg-white tw-rounded-lg tw-border-gray-100 tw-shadow-none hover:tw-border-gray-200 hover:tw-shadow-none"
        thumbnail={<ToolboxItemThumbnail item={field} size={24} className="tw-shrink-0" />}
      />
    )
  );
};
