import { useEditor } from '../store/useEditor';
import { ToolboxList } from './ToolboxList';

export const ToolboxPanel = () => {
  const { toolbox } = useEditor();

  return (
    <div
      id="toolbox"
      className="w-64 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50/80 border-r border-gray-200">
      <h2 className="border-b border-gray-200 font-bold p-3">Components</h2>
      <ToolboxList section="Inputs" items={toolbox.fields.inputs} />
      <ToolboxList section="Selections" items={toolbox.fields.selections} />
      <ToolboxList
        section="Presentation"
        items={toolbox.fields.presentations}
      />
    </div>
  );
};
