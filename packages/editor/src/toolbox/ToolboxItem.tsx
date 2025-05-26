type ToolboxItemProps = {
  id: string;
  name: string;
  thumbnail?: React.ReactNode;
  className?: string;
};
export const ToolboxItem: React.FC<ToolboxItemProps> = ({
  id,
  name,
  thumbnail,
  className = ''
}) => {
  return (
    <div
      data-id={id}
      className={`${className} text-center min-h-28 flex flex-col items-center justify-center gap-1 border border-gray-300/80 rounded hover:shadow-sm hover:shadow-gray-300/80 w-full`}>
      {thumbnail}
      <small className="text-gray-600">{name}</small>
    </div>
  );
};
