import { describe, expect, it } from 'vitest';
import { withAdornment, withAdornmentContent, withAdornmentType } from './appearanceMutations';

describe('withAdornment', () => {
  it('sets the slot on an empty appearance', () => {
    const result = withAdornment(undefined, 'prefix', { type: 'text', content: 'kg' });

    expect(result.appearance).toEqual({ prefix: { type: 'text', content: 'kg' } });
  });

  it('replaces the slot without disturbing the other one', () => {
    const appearance = { prefix: { type: 'text' as const, content: 'old' }, suffix: { type: 'icon' as const, content: 'Search' } };

    const result = withAdornment(appearance, 'prefix', { type: 'icon', content: 'User' });

    expect(result.appearance).toEqual({
      prefix: { type: 'icon', content: 'User' },
      suffix: { type: 'icon', content: 'Search' }
    });
  });

  it('clears the slot when given undefined', () => {
    const appearance = { prefix: { type: 'text' as const, content: 'kg' } };

    expect(withAdornment(appearance, 'prefix', undefined).appearance).toEqual({ prefix: undefined });
  });

  it('preserves unrelated appearance keys', () => {
    const appearance = { position: 'horizontal', prefix: { type: 'text' as const, content: 'a' } };

    const result = withAdornment(appearance, 'suffix', { type: 'text', content: 'b' });

    expect(result.appearance).toMatchObject({ position: 'horizontal' });
  });

  it('does not mutate the input', () => {
    const appearance = { prefix: { type: 'text' as const, content: 'original' } };

    withAdornment(appearance, 'prefix', { type: 'text', content: 'changed' });

    expect(appearance.prefix.content).toBe('original');
  });
});

describe('withAdornmentType', () => {
  it('starts a slot with empty content', () => {
    const result = withAdornmentType(undefined, 'prefix', 'icon');

    expect(result.appearance).toEqual({ prefix: { type: 'icon', content: '' } });
  });

  // Icon names and free text are not interchangeable, so switching type has to
  // discard whatever the previous type held.
  it('resets content when the type changes', () => {
    const appearance = { prefix: { type: 'text' as const, content: 'kg' } };

    const result = withAdornmentType(appearance, 'prefix', 'icon');

    expect(result.appearance?.prefix).toEqual({ type: 'icon', content: '' });
  });
});

describe('withAdornmentContent', () => {
  it('updates content and keeps the existing type', () => {
    const appearance = { prefix: { type: 'icon' as const, content: '' } };

    const result = withAdornmentContent(appearance, 'prefix', 'Search');

    expect(result.appearance?.prefix).toEqual({ type: 'icon', content: 'Search' });
  });

  it('defaults to a text slot when none exists yet', () => {
    const result = withAdornmentContent(undefined, 'suffix', 'hello');

    expect(result.appearance?.suffix).toEqual({ type: 'text', content: 'hello' });
  });

  it('accepts empty content', () => {
    const appearance = { prefix: { type: 'text' as const, content: 'kg' } };

    expect(withAdornmentContent(appearance, 'prefix', '').appearance?.prefix).toEqual({ type: 'text', content: '' });
  });
});
