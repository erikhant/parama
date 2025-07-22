import { useFormBuilder } from '@parama-dev/form-builder-core';
import { Button } from '@parama-ui/react';
import { MonitorIcon, SaveIcon, SmartphoneIcon, TabletIcon } from 'lucide-react';
import { SchemaViewer } from './SchemaViewer';
import { Preview } from './Preview';
import { useEditor } from '../store/useEditor';
import { FormEditorProps } from '@parama-dev/form-builder-types';

export const Toolbar = ({ onSaveSchema }: { onSaveSchema: FormEditorProps['onSaveSchema'] }) => {
  const { editor } = useEditor();
  const { actions, schema, screenSize } = useFormBuilder();
  const fieldLength = actions.getFields().length;

  const handleSaveSchema = () => {
    if (onSaveSchema) {
      onSaveSchema(schema);
    }
  };

  return (
    <div className="w-full inline-flex justify-between items-center h-12 p-2 bg-white border-b border-gray-100">
      <div className="text-lg bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold ml-3">
        Parama Editor
      </div>
      <div>
        {/* Responsive view aspect ratio */}
        <div className="flex items-center space-x-5">
          <Button
            size="xs"
            variant={screenSize === 'mobile' ? 'fill' : 'ghost'}
            color="secondary"
            onClick={() => actions.changeScreenSize('mobile')}>
            <SmartphoneIcon size={16} />
          </Button>
          <Button
            size="xs"
            variant={screenSize === 'tablet' ? 'fill' : 'ghost'}
            color="secondary"
            onClick={() => actions.changeScreenSize('tablet')}>
            <TabletIcon size={16} />
          </Button>
          <Button
            size="xs"
            variant={screenSize === 'desktop' ? 'fill' : 'ghost'}
            color="secondary"
            onClick={() => actions.changeScreenSize('desktop')}>
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
        <Button size="sm" className="rounded-md" disabled={fieldLength === 0} onClick={handleSaveSchema}>
          <SaveIcon size={16} />
          Save
        </Button>
        {editor.options?.showJsonCode && <SchemaViewer schema={schema} />}
      </div>
    </div>
  );
};
