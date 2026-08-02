import { resetFormBuilder, storeActions, storeState } from '@parama-dev/form-builder-core/testing';
import type { FormSchema } from '@parama-dev/form-builder-types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Preview } from './Preview';

/** Radix's Sheet needs these; jsdom ships neither. */
function installBrowserStubs() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as unknown as typeof window.matchMedia;

  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  Element.prototype.scrollIntoView = vi.fn();
  // jsdom has no layout engine, so Radix's focus scope trips over these.
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
}

const schema: FormSchema = {
  id: 'preview-schema',
  version: '1.0.0',
  title: 'Preview',
  layout: { colSize: 12, gap: 4 },
  fields: [{ id: 'f1', name: 'email', type: 'text', label: 'email', width: 12, value: undefined } as never]
};

const openPreview = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /preview/i }));
  await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  return user;
};

/*
 * The preview mounts the renderer, and the renderer claims `render` mode so a
 * form never inherits editor mode from a previously mounted editor. Inside the
 * editor that claim has to be handed back when the preview closes, or the
 * canvas is left rendering as a live form.
 */
describe('Preview', () => {
  beforeEach(() => {
    resetFormBuilder();
    installBrowserStubs();
    storeActions().changeMode('editor');
  });

  it('switches to render mode while open, so the preview honours conditions', async () => {
    render(<Preview disabled={false} schema={schema} />);

    await openPreview();

    await waitFor(() => expect(storeState().mode).toBe('render'));
  });

  it('returns the editor to editor mode when closed', async () => {
    render(<Preview disabled={false} schema={schema} />);

    const user = await openPreview();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(storeState().mode).toBe('editor'));
  });

  // `changeMode('render')` clears the selection by design, so without this the
  // author loses their place in the properties panel every time they preview.
  it('restores the selected field after closing', async () => {
    storeActions().selectField('f1');

    render(<Preview disabled={false} schema={schema} />);

    const user = await openPreview();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(storeState().selectedFieldId).toBe('f1'));
  });
});
