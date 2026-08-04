import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@parama-ui/react';
import type { FallbackProps } from 'react-error-boundary';

/*
 * Typed from `FallbackProps` rather than restated. `error` is `unknown` there —
 * anything can be thrown, not just an `Error` — and declaring it narrower makes
 * the component unassignable to `FallbackComponent`.
 */
export function FallbackException({ error, resetErrorBoundary }: FallbackProps) {
  console.error('Error in Form Editor:', error);
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">Error Occured</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="text-red-500 bg-red-50 border border-red-200 p-4 rounded text-sm space-y-3">
          <p className="leading-relaxed">
            There was an error rendering the form editor. Please check the console for details.
          </p>
          <Button size="xs" color="danger" variant="outline" onClick={resetErrorBoundary}>
            Reload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
