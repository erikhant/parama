import { useFormBuilder } from '@form-builder/core';
import { FormField } from '@form-builder/types';
import { Button, FormItem, Input, Label, Slider } from '@parama-ui/react';
import { useEffect, useState } from 'react';
import { useEditor } from '../store/useEditor';
import { SectionPanel } from './SectionPanel';
import { PlusIcon } from 'lucide-react';

type EventsEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const EventsEditor = ({ field, onChange }: EventsEditorProps) => {
  const { editor } = useEditor();
  const { selectedFieldId, actions } = useFormBuilder();

  return (
    <SectionPanel title="Events" description="Trigger actions based on events" className="space-y-2">
      <div className="flex items-center justify-end">
        <Button variant="ghost" color="secondary" size="xs">
          <PlusIcon className="size-4" />
        </Button>
      </div>
      <FormItem></FormItem>
    </SectionPanel>
  );
};
