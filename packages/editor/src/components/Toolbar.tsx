import { useFormBuilder } from '@parama-dev/form-builder-core';
import { Button } from '@parama-ui/react';
import { MonitorIcon, SaveIcon, SmartphoneIcon, TabletIcon } from 'lucide-react';
import { SchemaViewer } from './SchemaViewer';
import { Preview } from './Preview';
import { useEditor } from '../store/useEditor';
import { FormEditorProps } from '@parama-dev/form-builder-types';
import React from 'react';

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
    <div className="tw-w-full tw-inline-flex tw-justify-between tw-items-center tw-h-12 tw-p-2 tw-bg-white tw-border-b tw-border-gray-100">
      <div className="tw-text-lg tw-bg-gradient-to-r tw-from-blue-500 tw-to-violet-500 tw-bg-clip-text tw-text-transparent tw-font-semibold tw-ml-3">
        {typeof editor.options?.brand === 'string' ? (
          editor.options.brand
        ) : React.isValidElement(editor.options?.brand) ? (
          editor.options?.brand
        ) : typeof editor.options?.brand === 'function' ? (
          React.createElement(editor.options?.brand as React.ComponentType)
        ) : (
          <div className="tw-w-5" />
        )}
      </div>
      <div>
        {/* Responsive view aspect ratio */}
        <div className="tw-flex tw-items-center tw-space-x-5">
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
      <div className="tw-flex tw-space-x-2">
        <Preview
          schema={schema}
          disabled={fieldLength === 0}
          onOpenChange={(isOpen) => actions.changeMode(isOpen ? 'render' : 'editor')}
        />
        <Button size="sm" className="tw-rounded-md" disabled={fieldLength === 0} onClick={handleSaveSchema}>
          <SaveIcon size={16} />
          Save
        </Button>
        {editor.options?.showJsonCode && <SchemaViewer schema={schema} />}
      </div>
    </div>
  );
};
