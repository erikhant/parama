import { Command as CommandPrimitive } from 'cmdk';
import { Check } from 'lucide-react';
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Skeleton } from './skeleton';

export type Option = Record<'id' | 'value' | 'label', string> & {
  description?: string;
};

type AutoCompleteProps = {
  options: Option[];
  emptyMessage: string;
  value?: Option;
  onValueChange?: (value: Option) => void;
  isLoading?: boolean;
  shouldFilter?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export const AutoComplete = ({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  shouldFilter = true,
  disabled,
  isLoading = false
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option>(value as Option);
  const [inputValue, setInputValue] = useState<string>(value?.label || '');

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      setSelected(value);
      setInputValue(value.label);
    } else {
      setSelected(undefined as any);
      setInputValue('');
    }
  }, [value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === 'Enter' && input.value !== '') {
        const optionToSelect = options.find((option) => option.label === input.value);
        if (optionToSelect) {
          setSelected(optionToSelect);
          onValueChange?.(optionToSelect);
          setOpen(false);
        }
      }

      if (event.key === 'Escape') {
        input.blur();
        setOpen(false);
      }
    },
    [isOpen, options, onValueChange]
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
    setInputValue(selected?.label || '');
  }, [selected]);

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(selectedOption.label);
      setSelected(selectedOption);
      onValueChange?.(selectedOption);

      // Close the dropdown and blur the input
      setOpen(false);
      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [onValueChange]
  );

  return (
    <CommandPrimitive shouldFilter={shouldFilter} onKeyDown={handleKeyDown}>
      <div>
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="autocomplete-input"
        />
      </div>
      <div className="autocomplete-content">
        {isOpen && (
          <div className={cn('autocomplete-body', 'autocomplete-body--open')}>
            <CommandList className="autocomplete-list">
              {isLoading ? (
                <CommandPrimitive.Loading>
                  <div className="autocomplete-skeleton-wrapper">
                    <Skeleton className="autocomplete-skeleton-loading" />
                  </div>
                </CommandPrimitive.Loading>
              ) : null}
              {options.length > 0 && !isLoading ? (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selected?.value === option.value;
                    return (
                      <CommandItem
                        key={option.id}
                        value={option.label}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onSelect={() => handleSelectOption(option)}
                        className={cn(
                          'autocomplete-option-item',
                          isSelected ? 'autocomplete-option-item--selected' : null
                        )}>
                        <div className="autocomplete-option-content" role="option">
                          <span className="autocomplete-option-label">{option.label}</span>
                          {option.description ? (
                            <span className="autocomplete-option-description">{option.description}</span>
                          ) : null}
                        </div>
                        {isSelected && isOpen ? <Check className="autocomplete-option-item-icon-selected" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
              {!isLoading ? (
                <CommandPrimitive.Empty className="autocomplete-empty-item">{emptyMessage}</CommandPrimitive.Empty>
              ) : null}
            </CommandList>
          </div>
        )}
      </div>
    </CommandPrimitive>
  );
};
