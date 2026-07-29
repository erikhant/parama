import type { FieldGroupItem, FormField } from '@parama-dev/form-builder-types';
import { v4 as uuid } from 'uuid';

/**
 * Builds the starting shape of a field dropped from the toolbox.
 *
 * The author sees this the instant they drop, so every type arrives already
 * usable — a choice field with items to rename, a select with options, a file
 * field with sensible limits — rather than an empty shell they have to
 * configure before the canvas shows anything.
 */

/** Grid columns a new input occupies: the full row. */
const FULL_WIDTH = 12;

/** Default upload cap for new file fields. */
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

const newId = () => `field-${uuid()}`;

/** Seeds a list of interchangeable entries, e.g. `Item 1` … `Item 3`. */
function seedEntries(noun: string, slug: string, count = 3): FieldGroupItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${slug}-${uuid()}`,
    label: `${noun} ${index + 1}`,
    value: `${slug}-${index + 1}`
  }));
}

/** Properties every named input starts with. */
function baseField(type: string) {
  return {
    id: newId(),
    name: type === 'file' ? 'file' : `name_${type}`,
    type,
    label: type === 'hidden' ? 'Hidden input' : 'Text label',
    width: FULL_WIDTH
  };
}

/**
 * Creates a new field of the given type.
 *
 * @param type - The toolbox item's field type
 * @returns A field ready to insert into the schema
 *
 * @remarks
 * Ids are UUID-based. They were previously derived from `Date.now()`, which
 * collided whenever two fields were created inside the same millisecond — and
 * because `insertField` rejects duplicate ids, the second field was silently
 * dropped.
 */
export function createField(type: string): FormField {
  const base = baseField(type);

  switch (type) {
    case 'checkbox':
    case 'radio':
      return { ...base, items: seedEntries('Item', 'item'), transformer: '' } as unknown as FormField;

    case 'select':
    case 'multiselect':
    case 'autocomplete':
      return {
        ...base,
        transformer: '',
        placeholder: 'Search options...',
        shouldFilter: true,
        options: seedEntries('Option', 'option')
      } as unknown as FormField;

    case 'date':
      return {
        ...base,
        transformer: '',
        mode: 'single',
        options: { dateFormat: 'dd/MM/yyyy' }
      } as unknown as FormField;

    case 'file':
      return {
        ...base,
        options: {
          multiple: false,
          maxFiles: 5,
          maxSize: DEFAULT_MAX_FILE_SIZE,
          accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt']
          },
          instantUpload: false,
          bulkUpload: false,
          server: ''
        }
      } as unknown as FormField;

    case 'button':
    case 'submit':
    case 'reset':
      // Buttons carry no `name`: they trigger an action rather than submit a value.
      return {
        id: newId(),
        label: 'Submit',
        type,
        width: 2,
        widthMobile: 4,
        action: 'submit',
        appearance: { color: 'primary', variant: 'fill', size: 'default' }
      } as unknown as FormField;

    case 'block':
      return {
        id: newId(),
        type: 'block',
        width: FULL_WIDTH,
        height: 3,
        content:
          '<div style="padding: 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px;"><h3>Custom HTML Block</h3><p>Edit this content in the properties panel to add your custom HTML.</p></div>'
      } as unknown as FormField;

    case 'spacer':
      return { id: newId(), type: 'spacer', width: FULL_WIDTH, height: 2, content: '' } as unknown as FormField;

    default:
      return { ...base, transformer: '' } as unknown as FormField;
  }
}
