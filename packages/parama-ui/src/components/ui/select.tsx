import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PortalAnchorProvider, useAnchoredRef, useModalContainer } from '../../theme/modalContainer';
import { useThemeScope } from '../../theme/ThemeScope';

/**
 * Wrapped so the trigger can tell the portalled menu where it lives — the menu
 * needs to render inside an enclosing modal rather than beside it. See
 * `modalContainer.ts` for what breaks otherwise.
 */
const Select: React.FC<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>> = ({
  children,
  onValueChange,
  ...props
}) => {
  /*
   * Swallow empty value changes.
   *
   * A single-choice select has no way for a user to choose "nothing" — the
   * primitive rejects an item with an empty value outright — so `''` never
   * represents an intent. It is emitted spuriously while the primitive
   * reconciles a controlled `value` that changed against an item collection it
   * has not caught up with, and forwarding it wrote the empty string straight
   * back into the caller's state.
   *
   * That is how a form lost a selection it had just hydrated: opening a record
   * whose value differed from the previously opened one cleared the field, so
   * the bug only appeared once two records in a row did not match. Callers that
   * genuinely need to clear the field can still set `value` themselves.
   */
  const handleValueChange = React.useCallback(
    (value: string) => {
      if (value === '') return;
      onValueChange?.(value);
    },
    [onValueChange]
  );

  return (
    <PortalAnchorProvider>
      <SelectPrimitive.Root {...props} onValueChange={handleValueChange}>
        {children}
      </SelectPrimitive.Root>
    </PortalAnchorProvider>
  );
};
Select.displayName = SelectPrimitive.Root.displayName;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const anchoredRef = useAnchoredRef<HTMLButtonElement>(ref);

  return (
    <SelectPrimitive.Trigger ref={anchoredRef} className={cn('select-trigger', className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="select-trigger-icon" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('select-scroll-up', className)}
    {...props}>
    <ChevronUp />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('select-scroll-down', className)}
    {...props}>
    <ChevronDown />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    container?: Element | DocumentFragment | null | undefined;
  }
>(({ className, children, position = 'popper', container, ...props }, ref) => {
  const { scopeProps, themeClass } = useThemeScope();
  const modalContainer = useModalContainer();

  // An explicit container wins. Otherwise render inside the enclosing modal, so
  // its focus trap, stacking context and pointer-events all treat the menu as
  // part of itself; `undefined` outside a modal is Radix's own default, the body.
  const resolved = container ?? modalContainer ?? undefined;

  return (
    <SelectPrimitive.Portal container={resolved}>
      <SelectPrimitive.Content
        ref={ref}
        {...scopeProps}
        className={cn(
          'select-content',
          position === 'popper' && 'select-content-popper',
          themeClass,
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'select-content-viewport',
            position === 'popper' && 'select-content-viewport-popper'
          )}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn('select-label', className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={cn('select-item', className)} {...props}>
    <span className="select-item-indicator">
      <SelectPrimitive.ItemIndicator>
        <Check />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('select-separator', className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
};
