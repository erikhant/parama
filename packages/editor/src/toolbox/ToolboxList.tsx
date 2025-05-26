import { DraggableItem, SortableItem } from '../components';
import { FieldTypeDef } from './fieldTypes';
import { ToolboxItem } from './ToolboxItem';

type ToolboxListProps = {
  items: FieldTypeDef[];
  columnSize?: number;
  section: string;
};

export const ToolboxList: React.FC<ToolboxListProps> = ({
  items,
  columnSize = 2,
  section
}) => {
  const id = `toolbox-${Date.now()}`;

  return (
    <div className="overflow-x-hidden">
      <label className="block font-semibold font-sm p-4 pb-0">{section}</label>
      <div className={`grid column-${columnSize} gap-2 p-4`}>
        {items.map((type, index) => (
          <SortableItem
            key={type.id}
            id={type.id}
            index={index}
            data={{ fromToolbox: true, id }}
            className="column-span-1"
            useDynamicIndicator={false}>
            <ToolboxItem
              id={id}
              name={type.label}
              thumbnail={<i className="text-lg">{type.icon}</i>}
            />
          </SortableItem>
        ))}
      </div>
    </div>
  );
};
