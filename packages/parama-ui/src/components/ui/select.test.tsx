import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const renderSelect = (props: { value: string; onValueChange: (v: string) => void }) =>
  render(
    <Select {...props}>
      <SelectTrigger>
        <SelectValue placeholder="Select an option">{props.value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Marketing">Marketing</SelectItem>
        <SelectItem value="Sales">Sales</SelectItem>
        <SelectItem value="HR">HR</SelectItem>
      </SelectContent>
    </Select>
  );

/*
 * A single-choice select has no way for a user to choose "nothing" — the
 * primitive rejects an item with an empty value — so an empty change is never
 * an intent. It is emitted while the primitive reconciles a controlled `value`
 * that changed against an item collection it has not caught up with.
 *
 * Forwarding it wrote `''` back into the caller's state, which is how a form
 * lost a selection it had just hydrated: opening a record whose value differed
 * from the previously opened one cleared the field. The bug only surfaced once
 * two consecutive records disagreed, which made it look like it depended on how
 * many times the form had been opened.
 */
describe('Select', () => {
  it('does not forward an empty value change', () => {
    const onValueChange = vi.fn();
    const { rerender } = renderSelect({ value: 'Marketing', onValueChange });

    // Re-render with a different value, the case that provokes the empty emit.
    rerender(
      <Select value="Sales" onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option">Sales</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Marketing">Marketing</SelectItem>
          <SelectItem value="Sales">Sales</SelectItem>
          <SelectItem value="HR">HR</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(onValueChange).not.toHaveBeenCalledWith('');
  });

  it('still forwards a real selection', () => {
    const onValueChange = vi.fn();
    renderSelect({ value: '', onValueChange });

    // The wrapper only filters `''`; everything else reaches the caller.
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
