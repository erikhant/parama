import { useFormBuilder } from '@form-builder/core';
import { SortableList } from '../components';
import { useEditor } from '../store/useEditor';
import { EditableField } from './EditableField';

export const FormCanvas = () => {
  const { schema, actions } = useFormBuilder();
  const { canvas } = useEditor();

  return (
    <div className="grow flex-1 max-h-screen relative" onClick={() => actions.selectField(null)}>
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
  );
};
