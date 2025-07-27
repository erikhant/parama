import { useFormBuilder } from '@parama-dev/form-builder-core';
import { SortableList } from '../components';
import { useEditor } from '../store/useEditor';
import { EditableField } from './EditableField';
import { cn } from '@parama-ui/react';

export const FormCanvas = () => {
  const { schema, actions, screenSize } = useFormBuilder();
  const { canvas } = useEditor();

  // Define responsive styles based on screen size
  const getCanvasStyles = () => {
    switch (screenSize) {
      case 'mobile':
        return 'canvas-sm'; // 384px max width, centered with mobile simulation
      case 'tablet':
        return 'canvas-md'; // 672px max width, centered with tablet simulation
      case 'desktop':
      default:
        return 'canvas-xl'; // Full width
    }
  };

  return (
    <div
      className="tw-grow tw-flex-1 tw-max-h-screen tw-relative tw-overflow-y-auto"
      onClick={() => actions.selectField(null)}>
      {/* Viewport indicator */}
      {screenSize !== 'desktop' && (
        <div className="tw-absolute tw-top-2 tw-right-2 tw-z-10 tw-bg-blue-100 tw-text-blue-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-capitalize">
          {screenSize} view
        </div>
      )}
      <div className={cn('tw-transition-all tw-duration-300', getCanvasStyles())}>
        <SortableList
          id="canvas"
          items={schema.fields.map((f) => f.id)}
          className={`tw-grid column-${schema.layout.colSize} gap-size-${schema.layout.gap} ${schema.fields.length > 0 ? 'tw-pb-16 tw-my-5 tw-p-8' : 'tw-py-12 tw-px-8 tw-h-full'} tw-overflow-auto`}
          classNameIndicator="column-span-12 tw-h-14 tw-ml-4"
          useDynamicIndicator>
          {schema.fields.map((field, index) => (
            <EditableField key={field.id} field={field} index={index} />
          ))}
        </SortableList>
        {/* Empty state drop zone */}
        {canvas.currentInsertionIndex == null && schema.fields.length === 0 && (
          <div className="tw-absolute tw-inset-0 tw-text-gray-200/80 tw-flex tw-items-center tw-justify-center tw-text-4xl tw-font-bold">
            Drag field here
          </div>
        )}
      </div>
    </div>
  );
};
