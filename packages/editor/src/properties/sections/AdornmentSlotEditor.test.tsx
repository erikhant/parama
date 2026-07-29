import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdornmentSlotEditor } from './AdornmentSlotEditor';

const renderSlot = (props: Partial<React.ComponentProps<typeof AdornmentSlotEditor>> = {}) => {
  const onChange = vi.fn();

  render(
    <AdornmentSlotEditor
      label="Prefix"
      description="Add text or icon on the left side"
      slot="prefix"
      value={undefined}
      isReadOnly={false}
      onChange={onChange}
      {...props}
    />
  );

  return { onChange };
};

describe('AdornmentSlotEditor', () => {
  it('renders its label and description', () => {
    renderSlot();

    expect(screen.getByText('Prefix')).toBeInTheDocument();
    expect(screen.getByText('Add text or icon on the left side')).toBeInTheDocument();
  });

  describe('when the slot is empty', () => {
    it('offers an add control rather than a remove control', () => {
      renderSlot();

      expect(screen.getByRole('button', { name: /add prefix/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    });

    it('renders no content editor', () => {
      renderSlot();

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('disables the add control when read-only', () => {
      renderSlot({ isReadOnly: true });

      expect(screen.getByRole('button', { name: /add prefix/i })).toBeDisabled();
    });
  });

  describe('when the slot holds text', () => {
    const textValue = { type: 'text' as const, content: 'kg' };

    it('renders the content in a text input', () => {
      renderSlot({ value: textValue });

      expect(screen.getByRole('textbox')).toHaveValue('kg');
    });

    it('reports each edit', async () => {
      const user = userEvent.setup();
      const { onChange } = renderSlot({ value: textValue });

      await user.type(screen.getByRole('textbox'), 'X');

      expect(onChange).toHaveBeenLastCalledWith({ type: 'text', content: 'kgX' });
    });

    it('clears the slot when removed', async () => {
      const user = userEvent.setup();
      const { onChange } = renderSlot({ value: textValue });

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('disables the input and the remove control when read-only', () => {
      renderSlot({ value: textValue, isReadOnly: true });

      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();
    });
  });

  describe('when the slot holds an icon', () => {
    it('renders the icon picker instead of a text input', () => {
      renderSlot({ value: { type: 'icon', content: 'Search' } });

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });
  });
});
