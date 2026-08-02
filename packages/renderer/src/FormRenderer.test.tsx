import { resetFormBuilder, storeActions, storeState } from '@parama-dev/form-builder-core/testing';
import type { FormSchema } from '@parama-dev/form-builder-types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormRenderer } from './FormRenderer';

const schemaWith = (fields: any[]): FormSchema => ({
  id: 'test-schema',
  version: '1.0.0',
  title: 'Test',
  layout: { colSize: 12, gap: 4 },
  fields
});

const textField = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
  id,
  name,
  type: 'text',
  label: name,
  width: 12,
  value: undefined,
  ...extra
});

describe('FormRenderer', () => {
  beforeEach(() => {
    resetFormBuilder();
  });

  it('renders a label per field', () => {
    render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} />);

    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('seeds inputs from the data prop', () => {
    render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} data={{ email: 'a@b.c' }} />);

    expect(screen.getByRole('textbox')).toHaveValue('a@b.c');
  });

  it('marks a required field with an asterisk', () => {
    const field = textField('f1', 'email', {
      validations: [{ type: 'required', message: 'Required' }]
    });

    render(<FormRenderer schema={schemaWith([field])} />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  // BUG 3: `FormFieldRenderer` accepted an `onChange` prop and never called it,
  // so the entire `FormBuilderProps.onChange` API was inert.
  describe('onChange', () => {
    it('fires when the user edits a field', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} onChange={onChange} />);
      await user.type(screen.getByRole('textbox'), 'hi');

      await waitFor(() => expect(onChange).toHaveBeenCalled());
    });

    it('reports values keyed by field name', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} onChange={onChange} />);
      await user.type(screen.getByRole('textbox'), 'x');

      await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ email: 'x' }));
    });

    it('does not fire on the initial render', () => {
      const onChange = vi.fn();

      render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} data={{ email: 'seed' }} onChange={onChange} />);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('submission', () => {
    it('submits name-keyed values when the form is valid', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      const fields = [
        textField('f1', 'email'),
        { id: 'b1', type: 'submit', action: 'submit', label: 'Send', width: 12 }
      ];

      render(<FormRenderer schema={schemaWith(fields)} data={{ email: 'a@b.c' }} onSubmit={onSubmit} />);
      await user.click(screen.getByRole('button', { name: 'Send' }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.c' }, 'application/json'));
    });

    // Submitted with `fireEvent.submit` rather than a button click on purpose.
    // A required field renders the native `required` attribute, so clicking
    // submit is stopped by the browser's own constraint validation before
    // React's handler runs — the library's validation never gets a turn. This
    // exercises the library path directly; the native gate is covered below.
    it('blocks submission when a required field is empty', async () => {
      const onSubmit = vi.fn();

      const fields = [
        textField('f1', 'email', { validations: [{ type: 'required', message: 'Email is required' }] }),
        { id: 'b1', type: 'submit', action: 'submit', label: 'Send', width: 12 }
      ];

      const { container } = render(<FormRenderer schema={schemaWith(fields)} onSubmit={onSubmit} />);
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => expect(screen.getByText('Email is required')).toBeInTheDocument());
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('renders the native required attribute, which gates the click path first', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      const fields = [
        textField('f1', 'email', { validations: [{ type: 'required', message: 'Email is required' }] }),
        { id: 'b1', type: 'submit', action: 'submit', label: 'Send', width: 12 }
      ];

      render(<FormRenderer schema={schemaWith(fields)} onSubmit={onSubmit} />);

      expect(screen.getByRole('textbox')).toBeRequired();

      await user.click(screen.getByRole('button', { name: 'Send' }));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // The store is a module singleton shared with the editor, and the editor sets
  // `mode: 'editor'` on mount without ever putting it back. A renderer mounted
  // afterwards inherited editor mode, where conditions do not hide fields —
  // silently disabling every conditional field in the form.
  describe('mode', () => {
    it('claims render mode on mount', () => {
      storeActions().changeMode('editor');

      render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} />);

      expect(storeState().mode).toBe('render');
    });

    it('applies conditions after the editor has been mounted', async () => {
      storeActions().changeMode('editor');

      const fields = [
        textField('trigger', 'trigger'),
        textField('secret', 'secret', {
          conditions: { hidden: { expression: '{{trigger}} === "hide"' } }
        })
      ];

      render(<FormRenderer schema={schemaWith(fields)} data={{ trigger: 'hide' }} />);

      await waitFor(() => expect(screen.queryByText('secret')).not.toBeInTheDocument());
    });
  });

  describe('conditions', () => {
    it('hides a field whose hidden condition is met', async () => {
      const fields = [
        textField('trigger', 'trigger'),
        textField('secret', 'secret', {
          conditions: { hidden: { expression: '{{trigger}} === "hide"' } }
        })
      ];

      render(<FormRenderer schema={schemaWith(fields)} data={{ trigger: 'hide' }} />);

      await waitFor(() => expect(screen.queryByText('secret')).not.toBeInTheDocument());
    });

    it('shows a field whose hidden condition is not met', () => {
      const fields = [
        textField('trigger', 'trigger'),
        textField('secret', 'secret', {
          conditions: { hidden: { expression: '{{trigger}} === "hide"' } }
        })
      ];

      render(<FormRenderer schema={schemaWith(fields)} data={{ trigger: 'show' }} />);

      expect(screen.getByText('secret')).toBeInTheDocument();
    });
  });
});

describe('FormRenderer theming', () => {
  beforeEach(() => {
    resetFormBuilder();
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    })) as unknown as typeof window.matchMedia;
  });

  it('defaults to light when no theme is given', () => {
    const { container } = render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} />);

    expect(container.querySelector('.dark')).toBeNull();
  });

  it('applies the dark theme from the theme prop', () => {
    const { container } = render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} theme="dark" />);

    expect(container.querySelector('.dark')).not.toBeNull();
  });

  // The wrapper must not become a layout box, or a host's flex rules would
  // apply to it instead of to the form.
  it('keeps the theme wrapper out of the layout', () => {
    const { container } = render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} theme="dark" />);

    expect(container.firstElementChild).toHaveClass('contents');
  });

  it('still renders the form as the effective root', () => {
    const { container } = render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} theme="dark" />);

    expect(container.querySelector('.contents > form')).not.toBeNull();
  });

  it('prefers a persisted theme over the prop', () => {
    window.localStorage.setItem('theme', 'light');

    const { container } = render(<FormRenderer schema={schemaWith([textField('f1', 'email')])} theme="dark" />);

    expect(container.querySelector('.dark')).toBeNull();
  });
});
