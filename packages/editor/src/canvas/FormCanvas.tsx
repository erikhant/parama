import { useFormBuilder } from '@form-builder/core';
import { SortableList } from '../components';
import { useEditor } from '../store/useEditor';
import { EditableField } from './EditableField';

export const FormCanvas = () => {
  const { schema, actions, screenSize } = useFormBuilder();
  const { canvas } = useEditor();

  // Define responsive styles based on screen size
  const getCanvasStyles = () => {
    const baseClasses = 'transition-all duration-300';
    switch (screenSize) {
      case 'mobile':
        return `${baseClasses} max-w-sm mx-auto border-2 border-gray-200 border-dashed rounded-lg bg-gray-50/30`; // 384px max width, centered with mobile simulation
      case 'tablet':
        return `${baseClasses} max-w-2xl mx-auto border-2 border-gray-200 border-dashed rounded-lg bg-gray-50/30`; // 672px max width, centered with tablet simulation
      case 'desktop':
      default:
        return `${baseClasses} w-full`; // Full width
    }
  };

  return (
    <div
      className="grow flex-1 max-h-screen relative overflow-y-auto"
      onClick={() => actions.selectField(null)}>
      {/* Viewport indicator */}
      {screenSize !== 'desktop' && (
        <div className="absolute top-2 right-2 z-10 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium capitalize">
          {screenSize} view
        </div>
      )}
      <div className={getCanvasStyles()}>
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
