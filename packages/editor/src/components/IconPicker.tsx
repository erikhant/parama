import { Button, Input, Popover, PopoverContent, PopoverTrigger, cn } from '@parama-ui/react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import * as LucideIcons from 'lucide-react';
import { useEditor } from '../store/useEditor';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  iconClassName?: string;
  className?: string;
}

// Memoize the expensive icon filtering operation
const getAvailableIcons = (): string[] => {
  return Object.keys(LucideIcons).filter((key) => key.startsWith('Lucide') && !key.endsWith('Icon'));
};

// Memoized icon button component
const IconButton = memo(
  ({
    iconName,
    isSelected,
    iconClassName,
    className,
    onClick
  }: {
    iconName: string;
    isSelected: boolean;
    iconClassName?: string;
    className?: string;
    onClick: () => void;
  }) => {
    const Icon = (LucideIcons as any)[iconName];

    return (
      <Button
        className={cn(className)}
        color={isSelected ? 'primary' : 'secondary'}
        size="sm"
        variant={isSelected ? 'outline' : 'ghost'}
        onClick={onClick}>
        <span>
          <Icon className={cn(iconClassName)} />
        </span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export const IconPicker = memo(({ value, onChange, iconClassName, className }: IconPickerProps) => {
  const { editor } = useEditor();

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 200);

  // Memoize available icons
  const availableIcons = useMemo(() => getAvailableIcons(), []);

  // Memoize filtered icons based on debounced search
  const filteredIcons = useMemo(() => {
    if (!debouncedSearch) return availableIcons;
    const searchLower = debouncedSearch.toLowerCase();
    return availableIcons.filter((iconName: string) => iconName.toLowerCase().includes(searchLower));
  }, [availableIcons, debouncedSearch]);

  // Memoize selected icon component
  const SelectedIcon = useMemo(() => {
    return value !== '' ? (LucideIcons as any)[value] : null;
  }, [value]);

  // Memoize search change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  // Memoize icon selection handler
  const handleIconSelect = useCallback(
    (iconName: string) => {
      onChange(iconName);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="secondary"
          disabled={editor.options?.propertiesSettings === 'readonly'}
          size={value ? 'lg' : 'xs'}
          className={cn('tw-w-full', className)}>
          {value ? (
            <>{SelectedIcon && <SelectedIcon size={15} className={cn('!tw-size-5', iconClassName)} />}</>
          ) : (
            <span>Pick an icon</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="tw-w-[300px] tw-p-0">
        <div className="tw-p-2">
          <Input placeholder="Search icons..." value={search} onChange={handleSearchChange} className="tw-mb-2" />
          <div className="tw-grid tw-grid-cols-6 tw-gap-2 tw-max-h-[300px] tw-overflow-y-auto">
            {filteredIcons.map((iconName: string) => (
              <IconButton
                key={iconName}
                iconName={iconName}
                isSelected={value === iconName}
                iconClassName={iconClassName}
                onClick={() => handleIconSelect(iconName)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

IconPicker.displayName = 'IconPicker';
