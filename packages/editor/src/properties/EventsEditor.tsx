import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { Events, FormField } from '@parama-dev/form-builder-types';
import { Button } from '@parama-ui/react';
import { PlusIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { EventDraft, EventList } from './events/EventList';
import {
  appendEvent,
  blankEvent,
  eventsOf,
  isEventComplete,
  removeEventAt,
  targetsFor,
  updateEventAt
} from './events/eventMutations';
import { useFieldSettings } from './hooks/useFieldSettings';
import { SectionPanel } from './SectionPanel';

type EventsEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

/**
 * Configures the actions a field triggers on other fields when its value
 * changes and its validation passes.
 *
 * The panel owns two things only: the list of saved events, and the draft being
 * added. Everything about an individual event — its form, its valid targets,
 * whether it is complete — lives alongside the pure transitions in `events/`.
 */
export const EventsEditor = memo<EventsEditorProps>(({ field, onChange }) => {
  const schema = useFormBuilder((state) => state.schema);
  const { isReadOnly, isEditable } = useFieldSettings('eventsSettings');

  const [draft, setDraft] = useState<Partial<Events> | null>(null);

  // Selecting a different field must not carry a half-typed event across.
  useEffect(() => {
    setDraft(null);
  }, [field.id]);

  const handleUpdate = useCallback(
    (index: number, patch: Partial<Events>) => onChange({ events: updateEventAt(field, index, patch) }),
    [field, onChange]
  );

  const handleRemove = useCallback(
    (index: number) => onChange({ events: removeEventAt(field, index) }),
    [field, onChange]
  );

  const handleSaveDraft = useCallback(() => {
    if (!draft || !isEventComplete(draft)) return;

    onChange({ events: appendEvent(field, draft as Events) });
    setDraft(null);
  }, [draft, field, onChange]);

  return (
    <SectionPanel title="Events" description="Trigger actions based on events" className="space-y-2">
      <EventList
        events={eventsOf(field)}
        schema={schema}
        sourceFieldId={field.id}
        isReadOnly={isReadOnly}
        onUpdate={handleUpdate}
        onRemove={handleRemove}
      />

      {draft ? (
        <EventDraft
          draft={draft}
          targets={targetsFor(schema, field.id, draft.type ?? 'setValue')}
          canSave={isEventComplete(draft)}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onSave={handleSaveDraft}
          onCancel={() => setDraft(null)}
        />
      ) : (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            color="secondary"
            size="xs"
            className="text-xs"
            disabled={!isEditable}
            onClick={() => setDraft(blankEvent())}>
            <PlusIcon className="size-4" />
            Add
          </Button>
        </div>
      )}
    </SectionPanel>
  );
});

EventsEditor.displayName = 'EventsEditor';
