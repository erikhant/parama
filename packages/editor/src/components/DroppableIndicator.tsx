type DroppableIndicatorProps = {
  className?: string;
};

export const DroppableIndicator: React.FC<DroppableIndicatorProps> = ({ className = '' }) => {
  return (
    <div
      className={`tw-bg-[#d0f0ff] tw-h-8 tw-rounded-md tw-border-2 tw-border-dashed tw-border-blue-500 ${className}`}
      style={{
        animation: 'fadeInScale 200ms ease-out'
      }}
    />
  );
};
