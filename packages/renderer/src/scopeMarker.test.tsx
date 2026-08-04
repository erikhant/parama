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
   * The marker sits on the `<form>` itself, which also carries the layout
   * classes. That only works because the build rewrites each scoped rule to
   * `:is([data-parama-scope], [data-parama-scope] *)`, matching the root as
   * well as its descendants — Tailwind's own `important` selector emits a plain
   * descendant combinator, under which a scope root loses every class it holds.
   *
   * No wrapper element, so a host's flex or grid rules still land on the form.
   */
  it('marks the form itself, without an intermediate wrapper', () => {
    const { container } = render(<FormRenderer schema={schema} />);

    const form = container.querySelector('form')!;
    expect(form.hasAttribute(PARAMA_SCOPE_ATTRIBUTE)).toBe(true);
    expect(form.className).toContain('grid');
    expect(form.closest(`[${PARAMA_SCOPE_ATTRIBUTE}]`)).toBe(form);
  });
});
