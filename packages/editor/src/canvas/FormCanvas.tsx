import { useFormBuilder } from '@form-builder/core';
import { SortableList } from '../components';
import { useEditor } from '../store/useEditor';
import { EditableField } from './EditableField';

export const FormCanvas = () => {
  const { schema, actions } = useFormBuilder();
  const { canvas } = useEditor();

  return (
    <div
      className="grow flex-1 max-h-screen"
      onClick={() => actions.selectField(null)}>
      <SortableList
        id="canvas"
        items={schema.fields.map((f) => f.id)}
        className={`grid column-${schema.layout.colSize} gap-size-${schema.layout.gap} p-8 pb-16 overflow-auto my-5`}
        classNameIndicator="column-span-12 h-14 ml-6"
        useDynamicIndicator>
        {schema.fields.map((field, index) => (
          <EditableField key={field.id} field={field} index={index} />
        ))}
      </SortableList>
      {/* Empty state drop zone */}
      {canvas.currentInsertionIndex == null && schema.fields.length === 0 && (
        <div className="col-span-12 h-full w-full flex justify-center items-center text-gray-400">
          Drag fields here
        </div>
      )}
    </div>
  );
};
