import type { FormSchema } from '@parama-dev/form-builder-types';
import { v4 as uuid } from 'uuid';

/**
 * The empty form used when no schema is supplied.
 *
 * @remarks
 * This is a module-level constant, so its `id` is generated once per bundle and
 * shared by every form that falls back to it. Store updates always copy the
 * schema before writing, so the constant itself is never mutated.
 */
export const defaultSchema: FormSchema = {
  id: uuid(),
  version: '1.0.0',
  title: 'Untitled Form',
  description: 'Not provided',
  layout: { colSize: 12, gap: 4 },
  fields: []
};
