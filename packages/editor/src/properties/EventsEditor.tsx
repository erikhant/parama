import { useFormBuilder } from '@parama-dev/form-builder-core';
import { Events, FormField } from '@parama-dev/form-builder-types';
import {
  Button,
  FormItem,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  FormGroup
} from '@parama-ui/react';
import { useEffect, useState } from 'react';
import { useEditor } from '../store/useEditor';
import { SectionPanel } from './SectionPanel';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { HelperTooltip } from '../components/HelperTooltip';

type EventsEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const EventsEditor = ({ field, onChange }: EventsEditorProps) => {
  const { editor } = useEditor();
  const { schema } = useFormBuilder();
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Events>>({
    type: 'setValue',
    target: '',
    params: { value: '' }
  });

  // Get all fields except the current one as potential targets
  const availableFields = schema.fields.filter((f) => f.id !== field.id);

  // Filter fields based on event type - only select fields for fetch options
  const getFilteredFields = (eventType: string) => {
    if (eventType === 'fetch') {
      return availableFields.filter(
        (f) => f.type === 'select' || f.type === 'multiselect' || f.type === 'autocomplete'
      );
    }
    return availableFields;
  };

  const handleAddEvent = () => {
    if (!newEvent.target) return;

    const updatedEvents = [...(('events' in field ? field.events : []) || []), newEvent as Events];
    onChange({ events: updatedEvents });
    setIsAddingEvent(false);
    setNewEvent({
      type: 'setValue',
      target: '',
      params: { value: '' }
    });
  };

  const handleRemoveEvent = (index: number) => {
    const updatedEvents = [...(('events' in field ? field.events : []) || [])];
    updatedEvents.splice(index, 1);
    onChange({ events: updatedEvents });
  };

  const handleUpdateEvent = (index: number, updates: Partial<Events>) => {
    const updatedEvents = [...(('events' in field ? field.events : []) || [])];
    updatedEvents[index] = { ...updatedEvents[index], ...updates };
    onChange({ events: updatedEvents });
  };

  useEffect(() => {
    setIsAddingEvent(false);
    setNewEvent({
      type: 'setValue',
      target: '',
      params: { value: '' }
    });
  }, [field.id]);

  const EventTooltip = () => (
    <HelperTooltip className="max-w-xs">
      Events are triggered when a field's value changes and validation is successful.
      <br />
      <br />
      <b>Types of events:</b>
      <br />• <code>setValue</code>: Set a value in the target field
      <br />• <code>reset</code>: Reset the target field to its default value
      <br />• <code>fetch</code>: Refresh dynamic options for the target field
      <br />
      <br />
      Use <code>{`{{fieldName}}`}</code> to reference other field values in the value parameter.
    </HelperTooltip>
  );

  return (
    <SectionPanel title="Events" description="Trigger actions based on events" className="space-y-2">
      {(('events' in field ? field.events?.length : 0) || 0) > 0 && (
        <Accordion type="multiple" className="mb-2">
          {('events' in field ? field.events : [])?.map((event: Events, index: number) => (
            <AccordionItem key={index} value={`event-${index}`}>
              <AccordionTrigger className="text-sm py-2 text-start whitespace-nowrap">
                {event.type === 'setValue' ? 'Set Value' : event.type === 'reset' ? 'Reset Field' : 'Fetch Options'}
                <span className="ml-2 text-xs opacity-70 max-w-32 pr-1.5 text-ellipsis line-clamp-1">
                  →{' '}
                  {(() => {
                    const targetField = availableFields.find((f) => f.id === event.target);
                    return targetField ? ('name' in targetField ? targetField.name : targetField.id) : event.target;
                  })()}
                </span>
              </AccordionTrigger>
              <AccordionContent className="!px-2 pb-4 ">
                <div className="space-y-3 pt-2">
                  <FormItem>
                    <Label>Action</Label>
                    <Select
                      disabled={editor.options?.eventsSettings === 'readonly'}
                      value={event.type}
                      onValueChange={(value) =>
                        handleUpdateEvent(index, { type: value as Events['type'], target: '' })
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="setValue">Set Value</SelectItem>
                        <SelectItem value="reset">Reset Field</SelectItem>
                        <SelectItem value="fetch">Fetch Options</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>

                  <FormItem>
                    <Label>Target field</Label>
                    <Select
                      disabled={editor.options?.eventsSettings === 'readonly'}
                      value={event.target}
                      onValueChange={(value) => handleUpdateEvent(index, { target: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target field" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilteredFields(event.type).map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {'name' in f ? f.name : f.id}
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
                          disabled={editor.options?.eventsSettings === 'readonly'}
                          onChange={(e) =>
                            handleUpdateEvent(index, {
                              params: { ...event.params, value: e.target.value }
                            })
                          }
                          placeholder="Enter value or expression {{fieldName}}"
                        />
                      </FormGroup>
                      <div className="flex items-center gap-1">
                        <p className="form-description">Use expression.</p>
                        <EventTooltip />
                      </div>
                    </FormItem>
                  )}

                  <Button
                    variant="outline"
                    color="secondary"
                    size="xs"
                    className="w-full mt-2 text-xs"
                    disabled={editor.options?.eventsSettings === 'readonly'}
                    onClick={() => handleRemoveEvent(index)}>
                    <Trash2Icon className="size-4" /> Remove
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {isAddingEvent ? (
        <div className="rounded-md space-y-3 pt-2">
          <FormItem>
            <Label>Action</Label>
            <Select
              value={newEvent.type}
              onValueChange={(value) => setNewEvent({ ...newEvent, type: value as Events['type'], target: '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="setValue">Set value</SelectItem>
                <SelectItem value="reset">Reset field</SelectItem>
                <SelectItem value="fetch">Fetch options</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>

          <FormItem>
            <Label>Target field</Label>
            <Select value={newEvent.target} onValueChange={(value) => setNewEvent({ ...newEvent, target: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {getFilteredFields(newEvent.type || 'setValue').map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {'name' in f ? f.name : f.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          {newEvent.type === 'setValue' && (
            <FormItem>
              <Label>Value</Label>
              <FormGroup prefix="fx">
                <Input
                  value={newEvent.params?.value || ''}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      params: { ...newEvent.params, value: e.target.value }
                    })
                  }
                />
              </FormGroup>
              <div className="flex items-center gap-1">
                <p className="form-description">Use expression.</p>
                <EventTooltip />
              </div>
            </FormItem>
          )}

          <div className="flex gap-1 justify-end !mt-5">
            <Button
              variant="fill"
              color="secondary"
              size="sm"
              className="text-xs"
              onClick={handleAddEvent}
              disabled={!newEvent.target || (newEvent.type === 'setValue' && !newEvent.params?.value)}>
              Save
            </Button>
            <Button
              variant="ghost"
              color="secondary"
              size="sm"
              className="text-xs"
              onClick={() => setIsAddingEvent(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            color="secondary"
            size="xs"
            className="text-xs"
            disabled={editor.options?.eventsSettings === 'readonly'}
            onClick={() => setIsAddingEvent(true)}>
            <PlusIcon className="size-4" />
            Add
          </Button>
        </div>
      )}
    </SectionPanel>
  );
};
