import { useFormBuilder } from '@parama-dev/form-builder-core';

type FieldHighligterProps = {
  id: string;
  children: React.ReactNode;
};

export const FieldHighligter: React.FC<FieldHighligterProps> = ({ id, children }) => {
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
      className={`tw-p-0.5 tw-pl-1 tw-w-full tw-outline-none tw-border-none focus:tw-ring-1 focus:tw-ring-blue-500 tw-ring-1 ${isActive ? 'tw-ring-blue-500 hover:tw-ring-blue-500' : 'tw-ring-transparent hover:tw-ring-blue-500/50'}`}
      data-id={id}
      onClick={activateField}>
      {children}
    </div>
  );
};
