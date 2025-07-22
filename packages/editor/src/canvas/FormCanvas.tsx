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
    <div className="grow flex-1 max-h-screen relative overflow-y-auto" onClick={() => actions.selectField(null)}>
      {/* Viewport indicator */}
      {screenSize !== 'desktop' && (
        <div className="absolute top-2 right-2 z-10 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium capitalize">
          {screenSize} view
        </div>
      )}
      <div className={cn('transition-all duration-300', getCanvasStyles())}>
        <SortableList
          id="canvas"
          items={schema.fields.map((f) => f.id)}
          className={`grid column-${schema.layout.colSize} gap-size-${schema.layout.gap} ${schema.fields.length > 0 ? 'pb-16 my-5 p-8' : 'py-12 px-8 h-full'} overflow-auto`}
          classNameIndicator="column-span-12 h-14 ml-4"
          useDynamicIndicator>
          {schema.fields.map((field, index) => (
            <EditableField key={field.id} field={field} index={index} />
          ))}
        </SortableList>
        {/* Empty state drop zone */}
        {canvas.currentInsertionIndex == null && schema.fields.length === 0 && (
          <div className="absolute inset-0 text-gray-200/80 flex items-center justify-center text-4xl font-bold">
            Drag field here
          </div>
        )}
      </div>
    </div>
  );
};
