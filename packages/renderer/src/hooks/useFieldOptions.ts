import type { AutoCompleteField, FieldGroupItem, MultiSelectField, SelectField } from '@parama-dev/form-builder-types';
import { useEffect, useState } from 'react';
import { useFormActions } from './useFieldFlags';

/** Field types whose options may come from a remote source. */
type OptionField = SelectField | MultiSelectField | AutoCompleteField;

export interface FieldOptionsResult {
  options: FieldGroupItem[];
  loading: boolean;
}

/**
 * Supplies a select-like field's options, from either its inline `options`
 * array or its configured external endpoint.
 *
 * Replaces the three near-identical effects that previously existed one per
 * field type. A remote reload is triggered whenever the `external` config
 * changes, including the `_refreshTimestamp` the workflow engine bumps to
 * service a `fetch` event.
 *
 * Responses from a superseded request are discarded, so a fast re-trigger
 * cannot leave stale options or a stuck spinner behind.
 */
export function useFieldOptions(field: OptionField): FieldOptionsResult {
  const actions = useFormActions();
  const [options, setOptions] = useState<FieldGroupItem[]>(field.options ?? []);
  const [loading, setLoading] = useState(false);

  const external = field.external;
  const inlineOptions = field.options;

  useEffect(() => {
    if (!external) {
      if (Array.isArray(inlineOptions)) setOptions(inlineOptions);
      return;
    }

    let cancelled = false;

    actions.clearFieldError(field.id);
    setLoading(true);

    actions
      .refreshDynamicOptions(field)
      .then((fetched) => {
        if (cancelled) return;
        setOptions(fetched);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `external` is compared by reference: the engine replaces the whole object
    // (with a new `_refreshTimestamp`) whenever a reload is required.
  }, [actions, field.id, external, inlineOptions]);

  return { options, loading };
}
