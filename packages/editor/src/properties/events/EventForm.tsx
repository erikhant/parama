import type { Events, FormField } from '@parama-dev/form-builder-types';
import {
  FormGroup,
  FormItem,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@parama-ui/react';
import { memo } from 'react';
import { EVENT_TYPE_LABELS, fieldLabel } from './eventMutations';
import { EventHelp } from './EventHelp';

interface EventFormProps {
  event: Partial<Events>;
  /** Fields this event may target, already filtered for its type. */
  targets: FormField[];
  isReadOnly: boolean;
  onChange: (patch: Partial<Events>) => void;
}

/**
 * The three inputs that define an event: what it does, what it acts on, and —
 * for `setValue` — the expression it writes.
 *
 * Shared by the editing and creating flows, which previously carried a copy of
 * this markup each and had drifted: the two copies labelled the same event
 * types differently ("Set Value" vs "Set value").
 *
 * Changing the action clears the target, because the valid targets differ per
 * type and a carried-over one may no longer be offered.
 */
export const EventForm = memo<EventFormProps>(({ event, targets, isReadOnly, onChange }) => (
  <>
    <FormItem>
      <Label>Action</Label>
      <Select
        value={event.type}
        disabled={isReadOnly}
        onValueChange={(value) => onChange({ type: value as Events['type'], target: '' })}>
        <SelectTrigger>
          <SelectValue placeholder="Select event type" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(EVENT_TYPE_LABELS) as Events['type'][]).map((type) => (
            <SelectItem key={type} value={type}>
              {EVENT_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>

    <FormItem>
      <Label>Target field</Label>
      <Select value={event.target} disabled={isReadOnly} onValueChange={(target) => onChange({ target })}>
        <SelectTrigger>
          <SelectValue placeholder="Select target field" />
        </SelectTrigger>
        <SelectContent>
          {targets.map((target) => (
            <SelectItem key={target.id} value={target.id}>
              {fieldLabel(target)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>

    {event.type === 'setValue' && (
      <FormItem>
        <Label>Value</Label>
        <FormGroup prefix="fx">
          <Input
            value={event.params?.value || ''}
            disabled={isReadOnly}
            placeholder="Enter value or expression {{fieldName}}"
            aria-label="Event value"
            onChange={(input) => onChange({ params: { ...event.params, value: input.target.value } })}
          />
        </FormGroup>
        <div className="flex items-center gap-1">
          <p className="form-description">Use expression.</p>
          <EventHelp />
        </div>
      </FormItem>
    )}
  </>
));

EventForm.displayName = 'EventForm';
