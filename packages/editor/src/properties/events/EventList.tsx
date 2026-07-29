import type { Events, FormField, FormSchema } from '@parama-dev/form-builder-types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@parama-ui/react';
import { Trash2Icon } from 'lucide-react';
import { memo } from 'react';
import { EVENT_TYPE_LABELS, resolveTargetLabel, targetsFor } from './eventMutations';
import { EventForm } from './EventForm';

interface EventListProps {
  events: Events[];
  schema: FormSchema;
  /** The field these events belong to; excluded from its own target list. */
  sourceFieldId: string;
  isReadOnly: boolean;
  onUpdate: (index: number, patch: Partial<Events>) => void;
  onRemove: (index: number) => void;
}

/**
 * The field's configured events, one collapsible row each.
 *
 * The row header summarises the event as "action → target" so the list stays
 * scannable without expanding every entry.
 */
export const EventList = memo<EventListProps>(
  ({ events, schema, sourceFieldId, isReadOnly, onUpdate, onRemove }) => {
    if (events.length === 0) return null;

    return (
      <Accordion type="multiple" className="mb-2">
        {events.map((event, index) => (
          // Events have no id of their own, so position is the only stable key.
          <AccordionItem key={`event-${index}`} value={`event-${index}`}>
            <AccordionTrigger className="text-sm py-2 text-start whitespace-nowrap">
              {EVENT_TYPE_LABELS[event.type]}
              <span className="ml-2 text-xs opacity-70 max-w-32 pr-1.5 text-ellipsis line-clamp-1">
                → {resolveTargetLabel(schema, event.target)}
              </span>
            </AccordionTrigger>

            <AccordionContent className="!px-2 pb-4">
              <div className="space-y-3 pt-2">
                <EventForm
                  event={event}
                  targets={targetsFor(schema, sourceFieldId, event.type)}
                  isReadOnly={isReadOnly}
                  onChange={(patch) => onUpdate(index, patch)}
                />

                <Button
                  variant="outline"
                  color="secondary"
                  size="xs"
                  className="w-full mt-2 text-xs"
                  disabled={isReadOnly}
                  onClick={() => onRemove(index)}>
                  <Trash2Icon className="size-4" /> Remove
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }
);

EventList.displayName = 'EventList';

interface EventDraftProps {
  draft: Partial<Events>;
  targets: FormField[];
  onChange: (patch: Partial<Events>) => void;
  onSave: () => void;
  onCancel: () => void;
  canSave: boolean;
}

/**
 * The inline form for adding an event.
 *
 * Held as a draft rather than appended immediately, so a half-configured event
 * never reaches the schema and never fires.
 */
export const EventDraft = memo<EventDraftProps>(({ draft, targets, onChange, onSave, onCancel, canSave }) => (
  <div className="rounded-md space-y-3 pt-2">
    <EventForm event={draft} targets={targets} isReadOnly={false} onChange={onChange} />

    <div className="flex gap-1 justify-end !mt-5">
      <Button variant="fill" color="secondary" size="sm" className="text-xs" onClick={onSave} disabled={!canSave}>
        Save
      </Button>
      <Button variant="ghost" color="secondary" size="sm" className="text-xs" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
));

EventDraft.displayName = 'EventDraft';
