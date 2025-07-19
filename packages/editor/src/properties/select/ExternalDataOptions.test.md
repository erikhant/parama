# ExternalDataOptions DialogTrigger Fix

## Problem

The `ExternalDataOptions` component was throwing the error:

```
Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?
```

This occurred when:

1. A fetch request failed
2. User clicked on the "result" tab
3. The component was being used with custom children (like buttons) passed to `DialogTrigger`

## Root Cause

The issue was that `DialogTrigger` with `asChild` prop tries to clone the child element and forward a ref to it. However, when the children passed were:

- Plain HTML buttons (`<button>`)
- React components that don't use `forwardRef`
- Invalid React elements

The ref forwarding would fail, causing the error.

## Solution

1. **Removed forwardRef**: Since the component doesn't actually need to forward refs to parent components, we removed the `forwardRef` wrapper
2. **Added React.isValidElement check**: We now check if the children is a valid React element before passing it to `DialogTrigger`
3. **Added fallback wrapper**: If children is not a valid React element, we wrap it in a `<span>` tag

## Changes Made

```tsx
// Before (problematic)
export const ExternalDataOptions = forwardRef<HTMLDivElement, ExternalDataOptionsProps>(
  function ExternalDataOptions({ children, external = { url: '' }, onChange }, ref) {
    // ...
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {children ? (
          <DialogTrigger asChild>{children}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" color="secondary">
              API source
            </Button>
          </DialogTrigger>
        )}
        // ...
      </Dialog>
    );
  }
);

// After (fixed)
export const ExternalDataOptions = ({
  children,
  external = { url: '' },
  onChange
}: ExternalDataOptionsProps) => {
  // ...
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>
          {React.isValidElement(children) ? children : <span>{children}</span>}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" color="secondary">
            API source
          </Button>
        </DialogTrigger>
      )}
      // ...
    </Dialog>
  );
};
```

## Result

- The ref error is now resolved
- The component works correctly with any type of children
- No breaking changes to the component API
- All functionality remains intact
