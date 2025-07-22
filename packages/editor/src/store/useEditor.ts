import {
  FieldTypeDef,
  FormEditorOptions,
  FormEditorProps,
  FormField,
  PresetTypeDef
} from '@parama-dev/form-builder-types';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDown10,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  CircleDot,
  CodeIcon,
  EyeOff,
  MousePointerClick,
  RectangleEllipsis,
  SeparatorHorizontalIcon,
  TextCursorInput,
  Upload,
  WholeWord
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';

const fieldTypes: FieldTypeDef[] = [
  {
    id: uuid(),
    type: 'hidden',
    label: 'Hidden input',
    icon: EyeOff as LucideIcon,
    group: 'fields',
    description: 'A hidden input field that is not visible to the user.'
  },
  {
    id: uuid(),
    type: 'text',
    label: 'Text input',
    icon: TextCursorInput as LucideIcon,
    group: 'fields',
    description: 'A single-line text input field for short text entries.'
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Number',
    icon: ArrowDown10 as LucideIcon,
    group: 'fields',
    description: 'A numeric input field for entering numbers.'
  },
  {
    id: uuid(),
    type: 'textarea',
    label: 'Text area',
    icon: WholeWord as LucideIcon,
    group: 'fields',
    description: 'A multi-line text input field for longer text entries.'
  },
  {
    id: uuid(),
    type: 'password',
    label: 'Password input',
    icon: RectangleEllipsis as LucideIcon,
    group: 'fields',
    description: 'Input field for entering sensitive information.'
  },
  {
    id: uuid(),
    type: 'date',
    label: 'Date',
    icon: CalendarDays as LucideIcon,
    group: 'fields',
    description: 'Date picker input field for selecting dates.'
  },
  {
    id: uuid(),
    type: 'select',
    label: 'Select',
    icon: ChevronDown as LucideIcon,
    group: 'fields',
    description: 'Choose one option from a list.'
  },
  {
    id: uuid(),
    type: 'multiselect',
    label: 'Multi-select',
    icon: ChevronDown as LucideIcon,
    group: 'fields',
    description: 'Choose multiple options from a list.'
  },
  {
    id: uuid(),
    type: 'checkbox',
    label: 'Checkbox',
    icon: CheckCheck as LucideIcon,
    group: 'fields',
    description: 'Select items from multiple options.'
  },
  {
    id: uuid(),
    type: 'radio',
    label: 'Radio',
    icon: CircleDot as LucideIcon,
    group: 'fields',
    description: 'Select one option from a set.'
  },
  {
    id: uuid(),
    type: 'submit',
    label: 'Button',
    icon: MousePointerClick as LucideIcon,
    group: 'fields',
    description: 'Trigger an action with a button.'
  },
  {
    id: uuid(),
    type: 'file',
    label: 'File upload',
    icon: Upload as LucideIcon,
    group: 'fields',
    description: 'Upload file for selecting files.'
  },
  {
    id: uuid(),
    type: 'spacer',
    label: 'Spacer',
    icon: SeparatorHorizontalIcon as LucideIcon,
    group: 'fields',
    description: 'A spacer block for layout purposes.'
  },
  {
    id: uuid(),
    type: 'block',
    label: 'HTML Block',
    icon: CodeIcon as LucideIcon,
    group: 'fields',
    description: 'Custom HTML content block.'
  }
];

interface FormEditorState {
  initialize: (props: Omit<FormEditorProps, 'schema'>) => void;
  editor: {
    setInsertionIndex: (index: number | null) => void;
    setLocalField: (field: FormField | null) => void;
  } & Omit<FormEditorProps, 'schema'>;
  canvas: {
    currentInsertionIndex: number | null;
  };
  toolbox: {
    fields: FieldTypeDef[];
    presets: PresetTypeDef[];
  };
  properties: {
    localField: FormField | null;
  };
}

const defaultOptions: FormEditorOptions = {
  showJsonCode: true,
  generalSettings: 'on',
  appearanceSettings: 'on',
  validationSettings: 'on',
  conditionsSettings: 'on',
  eventsSettings: 'on'
};

export const useEditor = create<FormEditorState>((set, get) => ({
  initialize: (props) => {
    const { options: customOptions, ...editorProps } = props;
    const mergedOptions = Object.assign({}, defaultOptions, customOptions);
    set((state) => ({
      editor: {
        ...state.editor,
        ...editorProps,
        options: mergedOptions
      },
      toolbox: {
        ...state.toolbox,
        presets: typeof editorProps.loadPreset === 'function' ? editorProps.loadPreset() : editorProps.loadPreset || []
      }
    }));
  },
  editor: {
    options: defaultOptions,
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
    fields: fieldTypes,
    presets: []
  },
  properties: {
    localField: null
  }
}));
