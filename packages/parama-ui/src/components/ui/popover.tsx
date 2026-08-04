import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';
import { PortalAnchorProvider, useAnchoredRef, useModalContainer } from '../../theme/modalContainer';
import { useThemeScope } from '../../theme/ThemeScope';

/** Wrapped so the trigger can tell the portalled content which modal it is in. */
const Popover: React.FC<React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>> = ({ children, ...props }) => (
  <PortalAnchorProvider>
    <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
  </PortalAnchorProvider>
);
Popover.displayName = PopoverPrimitive.Root.displayName;

const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  const anchoredRef = useAnchoredRef<HTMLButtonElement>(ref);

  return <PopoverPrimitive.Trigger ref={anchoredRef} {...props} />;
});
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  container?: Element | DocumentFragment | null | undefined;
};

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = 'center', sideOffset = 4, container, ...props }, ref) => {
  const { scopeProps, themeClass } = useThemeScope();
  const modalContainer = useModalContainer();

  return (
    // An explicit container still wins — the date picker anchors its popover to
    // the field's own wrapper. Otherwise the enclosing modal, so the popover
    // sits inside its focus trap and stacking context rather than beside them.
    <PopoverPrimitive.Portal container={container ?? modalContainer ?? undefined}>
      <PopoverPrimitive.Content
        ref={ref}
        {...scopeProps}
        align={align}
        sideOffset={sideOffset}
        className={cn('popover-content', themeClass, className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});

PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
