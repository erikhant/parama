import { useFormBuilder } from '@form-builder/core';

type FieldHighligterProps = {
  id: string;
  children: React.ReactNode;
};

export const FieldHighligter: React.FC<FieldHighligterProps> = ({
  id,
  children
}) => {
  const { selectedFieldId, actions } = useFormBuilder();
  const isActive = selectedFieldId === id;
  const activateField = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    actions.selectField(id);
    e.stopPropagation();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`p-0.5 pl-1 w-full outline-none border-none focus:ring-1 focus:ring-blue-500 ring-1 ${isActive ? 'ring-blue-500 hover:ring-blue-500' : 'ring-transparent hover:ring-blue-500/50'}`}
      data-id={id}
      onClick={activateField}>
      {children}
    </div>
  );
};
