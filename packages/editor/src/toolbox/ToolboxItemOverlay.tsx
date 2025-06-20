import React from 'react';
import { useEditor } from '../store/useEditor';
import { ToolboxItem } from './ToolboxItem';
import { LucideIcon } from 'lucide-react';

type ToolboxItemOverlayProps = {
  id: string;
};

export const ToolboxItemOverlay: React.FC<ToolboxItemOverlayProps> = ({ id }) => {
  const { toolbox } = useEditor();
  const inputs = toolbox.fields.find((f) => f.id === id);

  let field: any = null;
  if (inputs) {
    field = inputs;
  }

  return (
    field && (
      <ToolboxItem
        id={id}
        name={field.label}
        className="flex-row items-center justify-start gap-3 font-medium h-auto p-2 bg-white rounded-lg border-gray-100 shadow-none hover:border-gray-200 hover:shadow-none"
        thumbnail={
          typeof field.icon === 'string' ? (
            field.icon
          ) : (
            <div className="bg-gray-100 rounded-md p-3">
              {React.createElement(field.icon as LucideIcon, {
                className: 'text-gray-500',
                size: 24
              })}
            </div>
          )
        }
      />
    )
  );
};
