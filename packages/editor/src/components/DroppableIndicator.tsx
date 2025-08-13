type DroppableIndicatorProps = {
  className?: string;
};

export const DroppableIndicator: React.FC<DroppableIndicatorProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-[#d0f0ff] h-8 rounded-md border-2 border-dashed border-blue-500 transition-opacity duration-150 ease-out ${className}`}
      style={{
        animation: 'fadeIn 150ms ease-out'
      }}
    />
  );
};
