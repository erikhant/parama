import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, Button, Input, cn } from '@parama-ui/react';
import { useDebounce } from 'use-debounce';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  iconClassName?: string;
  className?: string;
}

// Memoize the expensive icon filtering operation
const getAvailableIcons = (): string[] => {
  return Object.keys(LucideIcons).filter(
    (key) => key.startsWith('Lucide') && !key.endsWith('Icon')
  );
};

// Memoized icon button component
const IconButton = React.memo(
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

export const IconPicker = React.memo(
  ({ value, onChange, iconClassName, className }: IconPickerProps) => {
    const [search, setSearch] = React.useState('');
    const [debouncedSearch] = useDebounce(search, 200);

    // Memoize available icons
    const availableIcons = React.useMemo(() => getAvailableIcons(), []);

    // Memoize filtered icons based on debounced search
    const filteredIcons = React.useMemo(() => {
      if (!debouncedSearch) return availableIcons;
      const searchLower = debouncedSearch.toLowerCase();
      return availableIcons.filter((iconName: string) =>
        iconName.toLowerCase().includes(searchLower)
      );
    }, [availableIcons, debouncedSearch]);

    // Memoize selected icon component
    const SelectedIcon = React.useMemo(() => {
      return value !== '' ? (LucideIcons as any)[value] : null;
    }, [value]);

    // Memoize search change handler
    const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    }, []);

    // Memoize icon selection handler
    const handleIconSelect = React.useCallback(
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
            size={value ? 'lg' : 'xs'}
            className={cn('w-full', className)}>
            {value ? (
              <>
                {SelectedIcon && (
                  <SelectedIcon size={15} className={cn('!size-5', iconClassName)} />
                )}
              </>
            ) : (
              <span>Pick an icon</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <div className="p-2">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={handleSearchChange}
              className="mb-2"
            />
            <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
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
  }
);

IconPicker.displayName = 'IconPicker';
