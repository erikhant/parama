import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { FormBuilderProps } from '@parama-dev/form-builder-types';
import { useEffect, useRef } from 'react';

/**
 * Reports value changes to the host's `onChange` callback.
 *
 * Subscribing to the store directly — rather than threading a callback down
 * through every field — means one notifier covers every way a value can change:
 * user input, `setValue` events fired by the workflow engine, and programmatic
 * resets.
 *
 * The initial state is not reported: `onChange` signals a change from what the
 * caller already provided, so firing on mount would just echo their own `data`
 * prop back at them.
 *
 * @param onChange - Host callback receiving name-keyed values
 */
export function useChangeNotifier(onChange: FormBuilderProps['onChange']): void {
  const formData = useFormBuilder((state) => state.formData);
  const initRevision = useFormBuilder((state) => state.initRevision);
  const getFormValues = useFormBuilder((state) => state.actions.getFormValues);

  const baselineRevision = useRef(-1);
  const lastFormData = useRef(formData);
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;

  useEffect(() => {
    // A new revision means the form was just seeded from props. Adopt that as
    // the baseline instead of reporting it — the caller supplied those values.
    // This also covers mount, where the provider initialises the store in an
    // effect that runs after this one.
    if (baselineRevision.current !== initRevision) {
      baselineRevision.current = initRevision;
      lastFormData.current = formData;
      return;
    }

    if (lastFormData.current === formData) return;

    lastFormData.current = formData;
    callbackRef.current?.(getFormValues());
  }, [formData, initRevision, getFormValues]);
}
