import { MonitorIcon, SaveIcon, SmartphoneIcon, TabletIcon } from 'lucide-react';
import { useFormBuilder } from '@form-builder/core';
import { Button } from '@parama-ui/react';
import { Preview } from './Preview';

export const Toolbar = () => {
  const { actions, schema } = useFormBuilder();
  const fieldLength = actions.getFields().length;
  return (
    <div className="w-full inline-flex justify-between items-center h-12 p-2 bg-white border-b border-gray-100">
      <div className="text-lg bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold ml-3">
        Parama Editor
      </div>
      <div>
        {/* Responsive view aspect ratio */}
        <div className="flex items-center space-x-5">
          <Button size="xs" variant="ghost" color="secondary" className="text-gray-600">
            <SmartphoneIcon size={16} />
          </Button>
          <Button size="xs" variant="ghost" color="secondary" className="text-gray-600">
            <TabletIcon size={16} />
          </Button>
          <Button size="xs" variant="ghost" color="secondary" className="text-gray-600">
            <MonitorIcon size={16} />
          </Button>
        </div>
      </div>
      <div className="flex space-x-2">
        <Preview
          schema={schema}
          disabled={fieldLength === 0}
          onOpenChange={(isOpen) => actions.changeMode(isOpen ? 'preview' : 'editor')}
        />
        <Button size="sm" className="rounded-md" disabled={fieldLength === 0}>
          <SaveIcon size={16} />
          Save
        </Button>
      </div>
    </div>
  );
};
