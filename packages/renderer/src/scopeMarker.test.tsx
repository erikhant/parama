import { resetFormBuilder } from '@parama-dev/form-builder-core/testing';
import type { FormSchema } from '@parama-dev/form-builder-types';
import { PARAMA_SCOPE_ATTRIBUTE } from '@parama-ui/react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormRenderer } from './FormRenderer';

const schema: FormSchema = {
  id: 'scope-schema',
  version: '1.0.0',
  title: 'Scope',
  layout: { colSize: 12, gap: 4 },
  fields: [{ id: 'f1', name: 'email', type: 'text', label: 'email', width: 12, value: undefined } as never]
};

/*
 * The bundled stylesheet's reset and utilities are keyed to
 * `[data-parama-scope]`. A rendered form has to carry it, or every field loses
 * its box-sizing and its border style — width-only `border-*` utilities set
 * neither, so they would render invisible.
 */
describe('FormRenderer scope marker', () => {
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

  it('renders the form inside a scoped root', () => {
    const { container } = render(<FormRenderer schema={schema} />);

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form!.closest(`[${PARAMA_SCOPE_ATTRIBUTE}]`)).not.toBeNull();
  });

  it('keeps every field inside the scope', () => {
    const { container } = render(<FormRenderer schema={schema} />);

    const input = container.querySelector('input');
    expect(input!.closest(`[${PARAMA_SCOPE_ATTRIBUTE}]`)).not.toBeNull();
  });

  /*
   * Utilities compile to `[data-parama-scope] .grid` — a descendant selector —
   * so any class on the marker element itself is never matched. The marker has
   * to be a bare wrapper; marking the `<form>` directly cost it its own `grid`
   * and collapsed the layout to `display: block`.
   */
  it('keeps the marker off the styled element', () => {
    const { container } = render(<FormRenderer schema={schema} />);

    const form = container.querySelector('form')!;
    expect(form.hasAttribute(PARAMA_SCOPE_ATTRIBUTE)).toBe(false);
    expect(form.className).toContain('grid');

    const scopeRoot = form.closest(`[${PARAMA_SCOPE_ATTRIBUTE}]`)!;
    expect(scopeRoot.className).toBe('');
  });

  // The wrapper must not become a layout box, or a host's flex/grid rules would
  // apply to it instead of to the form.
  it('keeps the scope wrapper out of the layout', () => {
    const { container } = render(<FormRenderer schema={schema} />);

    const scopeRoot = container.querySelector(`[${PARAMA_SCOPE_ATTRIBUTE}]`) as HTMLElement;
    expect(scopeRoot.style.display).toBe('contents');
  });
});
