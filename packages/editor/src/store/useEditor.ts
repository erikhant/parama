import type { FieldTypeDef } from '../toolbox';
import { create } from 'zustand';
import { FormField } from '@form-builder/types';
import {
  ArrowDown10,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  CircleDot,
  RectangleEllipsis,
  TextCursorInput,
  Upload,
  WholeWord
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const fieldTypes: FieldTypeDef[] = [
  {
    id: 'text',
    label: 'Text input',
    icon: TextCursorInput as LucideIcon,
    group: 'input',
    description: 'A single-line text input field for short text entries.'
  },
  {
    id: 'number',
    label: 'Number',
    icon: ArrowDown10 as LucideIcon,
    group: 'input',
    description: 'A numeric input field for entering numbers.'
  },
  {
    id: 'textarea',
    label: 'Text area',
    icon: WholeWord as LucideIcon,
    group: 'input',
    description: 'A multi-line text input field for longer text entries.'
  },
  {
    id: 'password',
    label: 'Password input',
    icon: RectangleEllipsis as LucideIcon,
    group: 'input',
    description: 'Input field for entering sensitive information.'
  },
  {
    id: 'date',
    label: 'Date',
    icon: CalendarDays as LucideIcon,
    group: 'input',
    description: 'Date picker input field for selecting dates.'
  },
  {
    id: 'select',
    label: 'Select',
    icon: ChevronDown as LucideIcon,
    group: 'selection',
    description: 'Choose one option from a list.'
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    icon: CheckCheck as LucideIcon,
    group: 'selection',
    description: 'Select items from multiple options.'
  },
  {
    id: 'radio',
    label: 'Radio',
    icon: CircleDot as LucideIcon,
    group: 'selection',
    description: 'Select one option from a set.'
  },
  {
    id: 'file',
    label: 'File upload',
    icon: Upload as LucideIcon,
    group: 'input',
    description: 'Upload file for selecting files.'
  }
];

interface FormEditorState {
  editor: {
    setInsertionIndex: (index: number | null) => void;
    setLocalField: (field: FormField | null) => void;
  };
  canvas: {
    currentInsertionIndex: number | null;
  };
  toolbox: {
    fields: FieldTypeDef[];
  };
  properties: {
    localField: FormField | null;
  };
}

export const useEditor = create<FormEditorState>((set, get) => ({
  editor: {
    setInsertionIndex: (index) => {
      set((state) => ({
        canvas: {
          ...state.canvas,
          currentInsertionIndex: index
        }
      }));
    },
    setLocalField: (field) => {
      set((state) => ({
        properties: {
          ...state.properties,
          localField: field
        }
      }));
    }
  },
  canvas: {
    currentInsertionIndex: null
  },
  toolbox: {
    fields: fieldTypes
  },
  properties: {
    localField: null
  }
}));
