import { useEditor } from '../store/useEditor';
import { ToolboxItem } from './ToolboxItem';

type ToolboxItemOverlayProps = {
  id: string;
};

export const ToolboxItemOverlay: React.FC<ToolboxItemOverlayProps> = ({
  id
}) => {
  const { toolbox } = useEditor();
  const inputs = toolbox.fields.inputs.find((f) => f.id === id);
  const selections = toolbox.fields.selections.find((f) => f.id === id);
  const presentations = toolbox.fields.presentations.find((f) => f.id === id);

  let field: any = null;
  if (inputs) {
    field = inputs;
  }
  if (selections) {
    field = selections;
  }
  if (presentations) {
    field = presentations;
  }

  return (
    field && (
      <ToolboxItem
        id={id}
        name={field.label}
        thumbnail={<i className="text-lg">{field.icon}</i>}
      />
    )
  );
};
