import { create } from 'zustand';
import { FieldTypeDef } from '../toolbox';
import { FormField } from '@form-builder/types';

const fieldTypes = {
  inputs: [
    { id: 'text', label: 'Text input', icon: '📝' },
    { id: 'number', label: 'Number', icon: '🔢' },
    { id: 'textarea', label: 'Text area', icon: '📝' },
    { id: 'password', label: 'Password input', icon: '🔑' },
    { id: 'date', label: 'Date picker', icon: '📅' },
    { id: 'file', label: 'File upload', icon: '📁' }
  ],
  selections: [
    { id: 'select', label: 'Select', icon: '▾' },
    { id: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { id: 'radio', label: 'Radio', icon: '🔘' }
  ],
  presentations: []
};

interface FormEditorState {
  editor: {
    setInsertionIndex: (index: number | null) => void;
    setLocalField: (field: FormField | null) => void;
  };
  canvas: {
    currentInsertionIndex: number | null;
  };
  toolbox: {
    fields: {
      inputs: FieldTypeDef[];
      selections: FieldTypeDef[];
      presentations: FieldTypeDef[];
    };
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
