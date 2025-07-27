import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@parama-ui/react';

export function FallbackException({
  error,
  resetErrorBoundary
}: {
  error: Error;
  resetErrorBoundary: (...args: any[]) => void;
}) {
  console.error('Error in Form Editor:', error);
  return (
    <Dialog open={true}>
      <DialogContent className="sm:tw-max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="tw-text-red-500">Error Occured</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="tw-text-red-500 tw-bg-red-50 tw-border tw-border-red-200 tw-p-4 tw-rounded tw-text-sm tw-space-y-3">
          <p className="tw-leading-relaxed">
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
