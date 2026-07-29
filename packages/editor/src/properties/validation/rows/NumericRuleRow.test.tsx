import type { ValidationRule } from '@parama-dev/form-builder-types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NumericRuleRow } from './NumericRuleRow';

const renderRow = (props: Partial<React.ComponentProps<typeof NumericRuleRow>> = {}) => {
  const onSet = vi.fn();
  const onRemove = vi.fn();

  render(
    <NumericRuleRow
      label="Min length"
      ruleType="minLength"
      rule={undefined}
      describe={(value) => `Minimum length is ${value}`}
      isReadOnly={false}
      onSet={onSet}
      onRemove={onRemove}
      {...props}
    />
  );

  return { onSet, onRemove };
};

const rule = (value: number): ValidationRule =>
  ({ type: 'minLength', value, message: `Minimum length is ${value}`, trigger: 'change' }) as ValidationRule;

describe('NumericRuleRow', () => {
  it('renders its label', () => {
    renderRow();

    expect(screen.getByText('Min length')).toBeInTheDocument();
  });

  it('shows the rule value when one is set', () => {
    renderRow({ rule: rule(3) });

    expect(screen.getByRole('spinbutton')).toHaveValue(3);
  });

  it('shows an empty input when no rule is set', () => {
    renderRow();

    expect(screen.getByRole('spinbutton')).toHaveValue(null);
  });

  it('reports a typed value with the generated message', async () => {
    const user = userEvent.setup();
    const { onSet } = renderRow();

    await user.type(screen.getByRole('spinbutton'), '5');

    expect(onSet).toHaveBeenLastCalledWith({
      trigger: 'change',
      type: 'minLength',
      value: 5,
      message: 'Minimum length is 5'
    });
  });

  // Clearing the input is how the panel removes a rule — there is no separate
  // delete control for numeric rules.
  it('removes the rule when the input is cleared', async () => {
    const user = userEvent.setup();
    const { onSet, onRemove } = renderRow({ rule: rule(3) });

    await user.clear(screen.getByRole('spinbutton'));

    expect(onRemove).toHaveBeenCalledWith('minLength');
    expect(onSet).not.toHaveBeenCalled();
  });

  it('ignores a negative value', async () => {
    const user = userEvent.setup();
    const { onSet } = renderRow();

    await user.type(screen.getByRole('spinbutton'), '-2');

    expect(onSet).not.toHaveBeenCalled();
  });

  it('disables the input when read-only', () => {
    renderRow({ isReadOnly: true });

    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });
});
